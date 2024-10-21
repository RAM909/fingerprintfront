import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TemperatureDashboard = () => {
    const [data, setData] = useState([]);
    const [highestTemp, setHighestTemp] = useState({ temp: -Infinity, time: '' });
    const [lowestTemp, setLowestTemp] = useState({ temp: Infinity, time: '' });

    useEffect(() => {
        const fetchData = async () => {
            // Replace with your actual API call
            const response = await fetch('http://localhost:3000/allhealth');
            const result = await response.json();

            const formattedData = result.data.map(item => ({
                time: item.time,
                temperature: parseFloat(item.temperature),
            }));

            setData(formattedData);

            formattedData.forEach(item => {
                if (item.temperature > highestTemp.temp) {
                    setHighestTemp({ temp: item.temperature, time: item.time });
                }
                if (item.temperature < lowestTemp.temp) {
                    setLowestTemp({ temp: item.temperature, time: item.time });
                }
            });
        };
        fetchData();
    }, []);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
            {/* Adjust height of the heading section */}
            <div className="p-6">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Temperature Measure</h1>
            </div>

            {/* Adjust height of the graph section */}
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Temperature Info below the chart */}
            <div className="mt-4 text-center text-sm text-gray-600">
                <p>Highest: {highestTemp.temp}°C at {highestTemp.time} | Lowest: {lowestTemp.temp}°C at {lowestTemp.time}</p>
            </div>
        </div>
    );
};

export default TemperatureDashboard;
