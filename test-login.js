
async function testLogin() {
    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin123', password: 'admin@123' })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
