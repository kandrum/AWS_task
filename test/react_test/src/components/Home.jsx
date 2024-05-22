import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import { FaSearch } from 'react-icons/fa';

const Home = () => {
  const [hostedZones, setHostedZones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [domainName, setDomainName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHostedZones();
  }, []);

  const fetchHostedZones = async () => {
    try {
      const response = await fetch('https://7gff8xytf4.execute-api.us-east-2.amazonaws.com/route53/hosted-zones');
      const data = await response.json();
      setHostedZones(data.hostedZones);
    } catch (error) {
      console.error('Error fetching hosted zones:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredHostedZones = hostedZones.filter(zone =>
    zone.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (zoneName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the hosted zone: ${zoneName}?`);
    if (!confirmDelete) return;

    try {
      // Ensure the domain name does not have a trailing dot
      const formattedZoneName = zoneName.endsWith('.') ? zoneName : `${zoneName}.`;
      const response = await fetch(`https://7gff8xytf4.execute-api.us-east-2.amazonaws.com/route53/delete-hosted-zone/${formattedZoneName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Hosted zone deleted successfully');
        fetchHostedZones();
      } else {
        if (result.error && result.error.includes('The specified hosted zone contains non-required resource record sets and so cannot be deleted.')) {
          alert('You need to delete all non-required resource record sets before deleting the hosted zone.');
        } else {
          console.error('Error deleting hosted zone:', result.message);
        }
      }
    } catch (error) {
      console.error('Error deleting hosted zone:', error);
    }
  };

  const handleAddHostedZone = async () => {
    try {
      const response = await fetch('https://7gff8xytf4.execute-api.us-east-2.amazonaws.com/route53/create-hosted-zone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainName }),
      });
      if (response.ok) {
        fetchHostedZones();
        setShowModal(false);
        setDomainName('');
      } else {
        console.error('Error creating hosted zone');
      }
    } catch (error) {
      console.error('Error creating hosted zone:', error);
    }
  };

  const handleRowDoubleClick = (zoneName) => {
    // Ensure the domain name does not have a trailing dot
    const formattedZoneName = zoneName.endsWith('.') ? zoneName.slice(0, -1) : zoneName;
    navigate(`/records/${formattedZoneName}`);
  };

  return (
    <div className={styles.container}>
      <h1>DNS Automate</h1>
      <div className={styles.searchBarContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by hosted zone name"
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchBar}
        />
      </div>
      <button className={styles.addButton} onClick={() => setShowModal(true)}>Add Hosted Zone</button>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Hosted Zone</h2>
            <input
              type="text"
              placeholder="example.com"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              className={styles.input}
            />
            <button className={styles.okButton} onClick={handleAddHostedZone}>OK</button>
            <button className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Hosted Zone Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredHostedZones.map(zone => (
            <tr key={zone.Id} onDoubleClick={() => handleRowDoubleClick(zone.Name)}>
              <td>{zone.Name}</td>
              <td>
                <button onClick={() => handleDelete(zone.Name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Home };
