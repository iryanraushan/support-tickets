require('dotenv').config();
const { MongoClient } = require('mongodb');

const tickets = [
  {
    title: "Login page not loading",
    description: "Users are unable to access the login page. The page shows a blank screen after clicking the login button.",
    status: "open",
    priority: 4,
    assignee: "John Doe"
  },
  {
    title: "Database connection timeout",
    description: "Application is experiencing frequent database connection timeouts during peak hours. This affects user experience significantly.",
    status: "in_progress",
    priority: 5,
    assignee: "Jane Smith"
  },
  {
    title: "Email notifications not working",
    description: "Users are not receiving email notifications for password resets and account confirmations.",
    status: "open",
    priority: 3,
    assignee: "Mike Johnson"
  },
  {
    title: "Mobile app crashes on startup",
    description: "The mobile application crashes immediately after opening on iOS devices running version 16 and above.",
    status: "resolved",
    priority: 5,
    assignee: "Sarah Wilson"
  },
  {
    title: "Search functionality returns no results",
    description: "The search feature is not returning any results even for valid queries. This started happening after the last deployment.",
    status: "in_progress",
    priority: 4,
    assignee: "David Brown"
  },
  {
    title: "Payment processing errors",
    description: "Multiple users reporting payment processing failures. Credit card transactions are being declined without proper error messages.",
    status: "open",
    priority: 5,
    assignee: "Lisa Davis"
  },
  {
    title: "UI elements overlapping on small screens",
    description: "On mobile devices with smaller screens, UI elements are overlapping making the interface unusable.",
    status: "open",
    priority: 2,
    assignee: "Tom Anderson"
  },
  {
    title: "File upload feature not working",
    description: "Users cannot upload files larger than 5MB. The upload progress bar gets stuck at 50% and eventually times out.",
    status: "resolved",
    priority: 3,
    assignee: "Emma Taylor"
  },
  {
    title: "Performance issues on dashboard",
    description: "The main dashboard takes more than 10 seconds to load. Users are complaining about slow response times.",
    status: "in_progress",
    priority: 4,
    assignee: "Chris Martinez"
  },
  {
    title: "API rate limiting too aggressive",
    description: "The API rate limiting is blocking legitimate requests from our mobile app. Need to adjust the rate limits for authenticated users.",
    status: "open",
    priority: 2,
    assignee: "Alex Thompson"
  }
];

async function addTickets() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('tickets');
    
    const ticketsWithTimestamps = tickets.map(ticket => ({
      ...ticket,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await collection.insertMany(ticketsWithTimestamps);
    console.log(`Successfully inserted ${result.insertedCount} tickets`);
    
  } catch (error) {
    console.error('Error inserting tickets:', error);
  } finally {
    await client.close();
  }
}

addTickets();