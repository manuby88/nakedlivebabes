// netlify/functions/announcements.js
const announcements = [];

exports.handler = async (event) => {
    // Handle GET request - fetch announcements
    if (event.httpMethod === 'GET') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(announcements)
        };
    }
    
    // Handle POST request - add announcement
    if (event.httpMethod === 'POST') {
        const { message, password } = JSON.parse(event.body);
        
        // Check password
        if (password !== 'admin123') {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }
        
        const newAnnouncement = {
            id: Date.now(),
            message: message,
            date: new Date().toLocaleString()
        };
        
        announcements.unshift(newAnnouncement);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ success: true, announcements })
        };
    }
    
    // Handle DELETE request - clear all
    if (event.httpMethod === 'DELETE') {
        const { password } = JSON.parse(event.body);
        
        if (password !== 'admin123') {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }
        
        announcements.length = 0;
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    }
};
