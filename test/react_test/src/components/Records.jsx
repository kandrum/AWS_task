import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Records.module.css';
import { FaSearch } from 'react-icons/fa';

const Records = () => {
  const { domainName } = useParams();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [recordValue, setRecordValue] = useState('');
  const [ttl, setTtl] = useState('300');

  useEffect(() => {
    fetchRecords();
  }, [domainName]);

  const fetchRecords = async () => {
    try {
      const formattedDomainName = domainName.endsWith('.') ? domainName.slice(0, -1) : domainName;
      const response = await fetch(`http://localhost:8080/route53/hosted-zones/${formattedDomainName}/records`);
      const data = await response.json();
      setRecords(data.records);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  const filteredRecords = records.filter(record =>
    (record.Name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') &&
    (record.Type.toLowerCase().includes(searchType.toLowerCase()) || searchType === '')
  );

  const handleCheckboxChange = (recordName) => {
    setSelectedRecords(prevSelectedRecords =>
      prevSelectedRecords.includes(recordName)
        ? prevSelectedRecords.filter(name => name !== recordName)
        : [...prevSelectedRecords, recordName]
    );
  };

  const handleDeleteRecords = async () => {
    try {
      const formattedDomainName = domainName.endsWith('.') ? domainName.slice(0, -1) : domainName;
      await Promise.all(selectedRecords.map(async (recordName) => {
        const record = records.find(r => r.Name === recordName);
        if (record) {
          await fetch('http://localhost:8080/route53/delete-record', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              domainName: formattedDomainName,
              recordName: record.Name,
              recordType: record.Type,
              recordValue: record.ResourceRecords.map(r => r.Value).join(', '),
              ttl: record.TTL
            }),
          });
        }
      }));
      fetchRecords();
      setSelectedRecords([]);
    } catch (error) {
      console.error('Error deleting records:', error);
    }
  };

  const handleCreateRecord = async () => {
    try {
      const formattedDomainName = domainName.endsWith('.') ? domainName.slice(0, -1) : domainName;
      const response = await fetch(`http://localhost:8080/route53/hosted-zones/${formattedDomainName}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordName,
          recordType,
          recordValue,
          ttl
        }),
      });
      if (response.ok) {
        fetchRecords();
        setShowCreateModal(false);
        setRecordName('');
        setRecordType('A');
        setRecordValue('');
        setTtl('300');
      } else {
        console.error('Error creating record');
      }
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleEditRecord = (record) => {
    setRecordName(record.Name);
    setRecordType(record.Type);
    setRecordValue(record.ResourceRecords.map(r => r.Value).join(', '));
    setTtl(record.TTL.toString());
    setShowEditModal(true);
  };

  const handleUpdateRecord = async () => {
    try {
      const formattedDomainName = domainName.endsWith('.') ? domainName.slice(0, -1) : domainName;
      const oldRecord = records.find(r => r.Name === recordName);
      const response = await fetch(`http://localhost:8080/route53/hosted-zones/${formattedDomainName}/edit-record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldRecordName: oldRecord.Name,
          oldRecordType: oldRecord.Type,
          oldRecordValue: oldRecord.ResourceRecords.map(r => r.Value).join(', '),
          oldTtl: oldRecord.TTL,
          newRecordName: recordName,
          newRecordType: recordType,
          newRecordValue: recordValue,
          newTtl: ttl
        }),
      });
      if (response.ok) {
        fetchRecords();
        setShowEditModal(false);
        setRecordName('');
        setRecordType('A');
        setRecordValue('');
        setTtl('300');
      } else {
        console.error('Error updating record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const getValuePlaceholder = () => {
    switch (recordType) {
      case 'A':
        return 'IPv4 address (e.g., 192.0.2.1)';
      case 'AAAA':
        return 'IPv6 address (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334)';
      case 'CNAME':
        return 'Domain name (e.g., example.com)';
      case 'MX':
        return 'Priority and mail server (e.g., 10 mail.example.com)';
      case 'TXT':
        return 'Text string (e.g., v=spf1 include:_spf.example.com ~all)';
      case 'SRV':
        return 'Priority, weight, port, target (e.g., 10 5 5060 sipserver.example.com)';
      case 'NS':
        return 'Name server (e.g., ns1.example.com)';
      case 'PTR':
        return 'Domain name (e.g., example.com)';
      case 'CAA':
        return 'Flags, tag, value (e.g., 0 issue "letsencrypt.org")';
      default:
        return 'Record value';
    }
  };

  return (
    <div className={styles.container}>
      <h1>Records for {domainName}</h1>
      <div className={styles.searchBarContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search records"
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchBar}
        />
        <select
          value={searchType}
          onChange={handleTypeChange}
          className={styles.searchBar}
        >
          <option value="">All Types</option>
          <option value="A">A</option>
          <option value="AAAA">AAAA</option>
          <option value="CNAME">CNAME</option>
          <option value="MX">MX</option>
          <option value="TXT">TXT</option>
          <option value="SRV">SRV</option>
          <option value="NS">NS</option>
          <option value="PTR">PTR</option>
          <option value="CAA">CAA</option>
        </select>
      </div>
      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={() => setShowCreateModal(true)}>Create Record</button>
        <button className={styles.actionButton} onClick={handleDeleteRecords}>Delete Selected</button>
        {selectedRecords.length === 1 && (
          <button className={styles.actionButton} onClick={() => handleEditRecord(records.find(r => r.Name === selectedRecords[0]))}>Edit Record</button>
        )}
        {selectedRecords.length > 1 && (
          <span>{selectedRecords.length} records selected</span>
        )}
      </div>
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Create Record</h2>
            <input
              type="text"
              placeholder="Record Name"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              className={styles.input}
            />
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className={styles.input}
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
              <option value="MX">MX</option>
              <option value="TXT">TXT</option>
              <option value="SRV">SRV</option>
              <option value="NS">NS</option>
              <option value="PTR">PTR</option>
              <option value="CAA">CAA</option>
            </select>
            <input
              type="text"
              placeholder={getValuePlaceholder()}
              value={recordValue}
              onChange={(e) => setRecordValue(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="TTL (e.g., 300)"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className={styles.input}
            />
            <button className={styles.okButton} onClick={handleCreateRecord}>OK</button>
            <button className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Record</h2>
            <input
              type="text"
              placeholder="Record Name"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              className={styles.input}
            />
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className={styles.input}
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
              <option value="MX">MX</option>
              <option value="TXT">TXT</option>
              <option value="SRV">SRV</option>
              <option value="NS">NS</option>
              <option value="PTR">PTR</option>
              <option value="CAA">CAA</option>
            </select>
            <input
              type="text"
              placeholder={getValuePlaceholder()}
              value={recordValue}
              onChange={(e) => setRecordValue(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="TTL (e.g., 300)"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              className={styles.input}
            />
            <button className={styles.okButton} onClick={handleUpdateRecord}>OK</button>
            <button className={styles.cancelButton} onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Type</th>
            <th>TTL</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(record => (
            <tr key={record.Name}>
              <td><input type="checkbox" onChange={() => handleCheckboxChange(record.Name)} /></td>
              <td>{record.Name}</td>
              <td>{record.Type}</td>
              <td>{record.TTL}</td>
              <td>{record.ResourceRecords.map(r => r.Value).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Records };
