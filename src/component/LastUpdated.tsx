import React, { useEffect, useState } from 'react';
import buildDateData from '../build-date.json';

const LastUpdated: React.FC = () => {
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        const formattedDate = new Date(buildDateData.buildDate).toLocaleString();
        setLastUpdated(formattedDate);
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <p>最終更新日時: {lastUpdated}</p>
        </div>
    );
};

export default LastUpdated;