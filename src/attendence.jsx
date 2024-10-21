// src/Attendance.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const timeslotMap = {
    1: '8:15-9:15',
    2: '9:15-10:15',
    3: '10:30-11:30',
    4: '11:30-12:30',
    5: '1:15-2:15',
    6: '2:15-3:15',
    7: '3:15-4:15',
    8: '4:15-5:15',
};

const Attendance = () => {
    const [date, setDate] = useState('');
    const [startDate, setStartDate] = useState(''); // Start date for defaulter calculation
    const [endDate, setEndDate] = useState(''); // End date for defaulter calculation
    const [timeSlots, setTimeSlots] = useState(Object.keys(timeslotMap));
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [defaulters, setDefaulters] = useState([]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
        setSelectedSlot(null); // Reset the selected slot when date changes
    };

    const fetchAttendance = async () => {
        try {
            const response = await axios.get('https://fingerprintbackend.onrender.com/allattendence');
            console.log(response.data.data);
            setAttendanceData(response.data.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        // Filter attendance based on selected date and time slot
        const filtered = attendanceData.filter(att => {
            const attendanceDate = new Date(att.createdAt).toISOString().split('T')[0];
            return att.timeslot == slot && attendanceDate === date;
        });
        console.log(filtered);
        setFilteredAttendance(filtered.length > 0 ? filtered[0].rollnoofstudentpresent : []);
        setModalOpen(true);
    };

    const calculateDefaulters = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Filter attendance data for the selected date range
        const filteredData = attendanceData.filter(att => {
            const attendanceDate = new Date(att.date);
            return attendanceDate >= start && attendanceDate <= end;
        });

        // Count the total number of sessions and attendance per student
        const totalSessions = filteredData.length;
        const attendanceCount = {};

        filteredData.forEach(att => {
            att.rollnoofstudentpresent.forEach(rollno => {
                if (!attendanceCount[rollno]) {
                    attendanceCount[rollno] = 0;
                }
                attendanceCount[rollno]++;
            });
        });

        // Calculate attendance percentage and identify defaulters
        const defaultersList = Object.keys(attendanceCount).filter(rollno => {
            const attendancePercentage = (attendanceCount[rollno] / totalSessions) * 100;
            return attendancePercentage < 75;
        });

        setDefaulters(defaultersList);
        console.log("Defaulters:", defaultersList);
    };

    useEffect(() => {
        fetchAttendance(); // Fetch all attendance data when component mounts
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-6 text-blue-700">Attendance Tracker</h1>
            <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="block mx-auto border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">Available Time Slots:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {timeSlots.map((slot) => (
                    <div
                        key={slot}
                        className={`bg-blue-50 shadow-lg rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition duration-300 ${selectedSlot === slot ? 'bg-blue-200' : ''}`}
                        onClick={() => handleSlotClick(slot)}
                    >
                        <h3 className="text-lg font-semibold text-center text-blue-700">{timeslotMap[slot]}</h3>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
                        <h3 className="text-xl font-semibold text-center text-blue-700">Attendance for {timeslotMap[selectedSlot]} on {date}</h3>
                        <ul className="mt-4">
                            {filteredAttendance.length > 0 ? (
                                filteredAttendance.map((rollno, index) => (
                                    <li key={index} className="text-center border-b text-black border-gray-300 py-2">{rollno}</li>
                                ))
                            ) : (
                                <li className="text-center text-black py-2">No attendance recorded for this time slot on the selected date.</li>
                            )}
                        </ul>
                        <div className="flex justify-center mt-4">
                            <button onClick={() => setModalOpen(false)} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Defaulter Section */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4 text-center text-red-600">Defaulter Calculator</h2>
                <div className="flex justify-center space-x-4 mb-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="flex justify-center">
                    <button onClick={calculateDefaulters} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300">
                        Calculate Defaulters
                    </button>
                </div>

                {defaulters.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-center text-red-700">Defaulters List</h3>
                        <ul className="mt-4">
                            {defaulters.map((rollno, index) => (
                                <li key={index} className="text-center border-b text-black border-gray-300 py-2">{rollno}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;
