import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../styles/Records.module.css';

const Records = () => {
  const { domainName } = useParams();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, [domainName]);

  const fetchRecords = async () => {
    try {
      // Ensure the domain name does not have a trailing dot
      const formattedDomainName = domainName.endsWith('.') ? domainName.slice(0, -1) : domainName;
      const response = await fetch(`http://localhost:8080/route53/hosted-zones/${formattedDomainName}/records`);
      const data = await response.json();
      setRecords(data.records);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Records for {domainName}</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>TTL</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.Name}>
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
