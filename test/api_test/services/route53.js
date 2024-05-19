const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

// Configure AWS SDK (optional, region can be set in ~/.aws/config)
AWS.config.update({ region: 'us-east-2' }); // Set region to us-east-2

// Create Route 53 service object
const route53 = new AWS.Route53();
//======================================================================================================
// Endpoint to create hosted zone
router.post('/create-hosted-zone', async (req, res) => {
  const { domainName } = req.body;

  const params = {
    CallerReference: `${Date.now()}`, // Unique string to identify the request
    Name: domainName,
  };

  try {
    const data = await route53.createHostedZone(params).promise();
    res.status(201).json({ message: 'Hosted zone created successfully', data });
  } catch (error) {
    console.error('Error creating hosted zone:', error);
    res.status(500).json({ message: 'Error creating hosted zone', error: error.message });
  }
});
//==============================================================================================================
// Endpoint to add DNS record using hosted zone name
router.post('/hosted-zones/:domainName/records', async (req, res) => {
  const { domainName } = req.params;
  const { recordName, recordType, recordValue, ttl } = req.body;

  try {
    // Ensure the domain name has a trailing dot
    const formattedDomainName = domainName.endsWith('.') ? domainName : `${domainName}.`;

    // List all hosted zones
    const hostedZones = await route53.listHostedZones().promise();
    // Find the hosted zone with the specified domain name
    const hostedZone = hostedZones.HostedZones.find(zone => zone.Name === formattedDomainName);

    if (!hostedZone) {
      return res.status(404).json({ message: 'Hosted zone not found' });
    }

    const hostedZoneId = hostedZone.Id.split('/').pop(); // Extract the hosted zone ID

    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT', // Use 'CREATE' or 'UPSERT'
            ResourceRecordSet: {
              Name: recordName,
              Type: recordType,
              TTL: ttl,
              ResourceRecords: [{ Value: recordValue }],
            },
          },
        ],
        Comment: 'Record created programmatically',
      },
      HostedZoneId: hostedZoneId,
    };

    const data = await route53.changeResourceRecordSets(params).promise();
    res.status(201).json({ message: 'DNS record added successfully', data });
  } catch (error) {
    console.error('Error adding DNS record:', error);
    res.status(500).json({ message: 'Error adding DNS record', error: error.message });
  }
});
//================================================================================================
// Endpoint to delete DNS record using hosted zone name
router.post('/delete-record', async (req, res) => {
  const { domainName, recordName, recordType, recordValue, ttl } = req.body;

  try {
    // List all hosted zones
    const hostedZones = await route53.listHostedZones().promise();
    // Find the hosted zone with the specified domain name
    const hostedZone = hostedZones.HostedZones.find(zone => zone.Name === `${domainName}.`);

    if (!hostedZone) {
      return res.status(404).json({ message: 'Hosted zone not found' });
    }

    const hostedZoneId = hostedZone.Id.split('/').pop(); // Extract the hosted zone ID

    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: recordName,
              Type: recordType,
              TTL: ttl,
              ResourceRecords: [{ Value: recordValue }],
            },
          },
        ],
        Comment: 'Record deleted programmatically',
      },
      HostedZoneId: hostedZoneId,
    };

    const data = await route53.changeResourceRecordSets(params).promise();
    res.status(200).json({ message: 'DNS record deleted successfully', data });
  } catch (error) {
    console.error('Error deleting DNS record:', error);
    res.status(500).json({ message: 'Error deleting DNS record', error: error.message });
  }
});
//=====================================================================================================

// Endpoint to edit DNS record using hosted zone name
router.post('/hosted-zones/:domainName/edit-record', async (req, res) => {
  const { domainName } = req.params;
  const { oldRecordName, oldRecordType, oldRecordValue, oldTtl, newRecordName, newRecordType, newRecordValue, newTtl } = req.body;

  try {
    // Ensure the domain name has a trailing dot
    const formattedDomainName = domainName.endsWith('.') ? domainName : `${domainName}.`;

    // List all hosted zones
    const hostedZones = await route53.listHostedZones().promise();
    // Find the hosted zone with the specified domain name
    const hostedZone = hostedZones.HostedZones.find(zone => zone.Name === formattedDomainName);

    if (!hostedZone) {
      return res.status(404).json({ message: 'Hosted zone not found' });
    }

    const hostedZoneId = hostedZone.Id.split('/').pop(); // Extract the hosted zone ID

    // Use UPSERT action to update the record
    const upsertParams = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: newRecordName,
              Type: newRecordType,
              TTL: newTtl,
              ResourceRecords: [{ Value: newRecordValue }],
            },
          },
        ],
        Comment: 'Record updated programmatically',
      },
      HostedZoneId: hostedZoneId,
    };

    const data = await route53.changeResourceRecordSets(upsertParams).promise();
    res.status(200).json({ message: 'DNS record edited successfully', data });
  } catch (error) {
    console.error('Error editing DNS record:', error);
    res.status(500).json({ message: 'Error editing DNS record', error: error.message });
  }
});
  //==================================================================================================
// Endpoint to delete hosted zone
router.delete('/delete-hosted-zone/:domainName', async (req, res) => {
  const { domainName } = req.params;

  try {
    // Ensure the domain name has a trailing dot
    const formattedDomainName = domainName.endsWith('.') ? domainName : `${domainName}.`;

    // List all hosted zones
    const hostedZones = await route53.listHostedZones().promise();
    // Find the hosted zone with the specified domain name
    const hostedZone = hostedZones.HostedZones.find(zone => zone.Name === formattedDomainName);

    if (!hostedZone) {
      return res.status(404).json({ message: 'Hosted zone not found' });
    }

    const hostedZoneId = hostedZone.Id.split('/').pop(); // Extract the hosted zone ID

    // Check if the hosted zone contains any resource record sets other than the default NS and SOA records
    const records = await route53.listResourceRecordSets({ HostedZoneId: hostedZoneId }).promise();
    const nonDefaultRecords = records.ResourceRecordSets.filter(record => record.Type !== 'NS' && record.Type !== 'SOA');

    if (nonDefaultRecords.length > 0) {
      return res.status(400).json({
        message: 'Error deleting hosted zone',
        error: 'The specified hosted zone contains non-required resource record sets and so cannot be deleted. Please delete these records first.'
      });
    }

    // Delete the hosted zone if no non-default records are present
    const data = await route53.deleteHostedZone({ Id: hostedZoneId }).promise();
    res.status(200).json({ message: 'Hosted zone deleted successfully', data });
  } catch (error) {
    console.error('Error deleting hosted zone:', error);
    res.status(500).json({ message: 'Error deleting hosted zone', error: error.message });
  }
});

//======================================================================================================
// Endpoint to fetch all hosted zones
router.get('/hosted-zones', async (req, res) => {
    try {
      const data = await route53.listHostedZones().promise();
      res.status(200).json({ hostedZones: data.HostedZones });
    } catch (error) {
      console.error('Error fetching hosted zones:', error);
      res.status(500).json({ message: 'Error fetching hosted zones', error: error.message });
    }
  });
  //====================================================================================================
  
  // Endpoint to fetch records for a specific hosted zone by name
  router.get('/hosted-zones/:domainName/records', async (req, res) => {
    const { domainName } = req.params;
  
    try {
      // List all hosted zones
      const hostedZones = await route53.listHostedZones().promise();
      // Find the hosted zone with the specified domain name
      const hostedZone = hostedZones.HostedZones.find(zone => zone.Name === `${domainName}.`);
  
      if (!hostedZone) {
        return res.status(404).json({ message: 'Hosted zone not found' });
      }
  
      const hostedZoneId = hostedZone.Id.split('/').pop(); // Extract the hosted zone ID
  
      // Fetch records for the specified hosted zone
      const data = await route53.listResourceRecordSets({ HostedZoneId: hostedZoneId }).promise();
      res.status(200).json({ records: data.ResourceRecordSets });
    } catch (error) {
      console.error('Error fetching records:', error);
      res.status(500).json({ message: 'Error fetching records', error: error.message });
    }
  });


module.exports = router;
