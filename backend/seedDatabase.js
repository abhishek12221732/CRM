require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const AudienceSegment = require('./models/AudienceSegment');
const Campaign = require('./models/Campaign');
const CommunicationLog = require('./models/CommunicationLog');

const customers = [
  {
    customerId: "cust1001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+15551234567",
    totalSpend: 1250.50,
    visitCount: 5,
    lastPurchaseDate: new Date("2023-05-15"),
    customTags: ["premium", "tech-savvy"]
  },
  {
    customerId: "cust1002",
    name: "Emily Johnson",
    email: "emily.j@example.com",
    phone: "+15559876543",
    totalSpend: 845.25,
    visitCount: 3,
    lastPurchaseDate: new Date("2023-06-20"),
    customTags: ["frequent", "fashion"]
  },
  {
    customerId: "cust1003",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "+15555551234",
    totalSpend: 2100.75,
    visitCount: 8,
    lastPurchaseDate: new Date("2023-04-10"),
    customTags: ["wholesale", "b2b"]
  },
  {
    customerId: "cust1004",
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    phone: "+15556667788",
    totalSpend: 450.00,
    visitCount: 2,
    lastPurchaseDate: new Date("2023-07-05"),
    customTags: ["new", "discount-seeker"]
  },
  {
    customerId: "cust1005",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "+15558889900",
    totalSpend: 3200.00,
    visitCount: 12,
    lastPurchaseDate: new Date("2023-03-22"),
    customTags: ["vip", "loyal"]
  }
];

const segments = [
  {
    name: "High Value Customers",
    description: "Customers with total spend over $1000",
    ruleGroups: [
      {
        combinator: "AND",
        rules: [
          {
            field: "totalSpend",
            operator: ">=",
            value: 1000
          }
        ]
      }
    ],
    estimatedSize: 3 // Should match actual count in your DB
  },
  {
    name: "Frequent Shoppers",
    description: "Customers with 3+ visits",
    ruleGroups: [
      {
        combinator: "AND",
        rules: [
          {
            field: "visitCount",
            operator: ">=",
            value: 3
          }
        ]
      }
    ],
    estimatedSize: 3
  },
  {
    name: "New Customers",
    description: "Customers who joined recently",
    ruleGroups: [
      {
        combinator: "AND",
        rules: [
          {
            field: "lastPurchaseDate",
            operator: ">=",
            value: "2023-06-01"
          }
        ]
      }
    ],
    estimatedSize: 1
  }
];
const campaigns = [
  {
    name: "Summer Sale 2023",
    segmentId: null, // Will be replaced with actual segment ID
    message: "Get 20% off on all summer collections! Use code SUMMER20",
    status: "completed",
    scheduledAt: new Date("2023-06-01T10:00:00Z"),
    startedAt: new Date("2023-06-01T10:05:23Z"),
    completedAt: new Date("2023-06-01T12:30:45Z"),
    totalRecipients: 3,
    sentCount: 3,
    failedCount: 0,
    createdBy: null // Will be replaced with actual user ID
  },
  {
    name: "New Arrivals",
    segmentId: null, // Will be replaced with actual segment ID
    message: "Check out our new arrivals for this season!",
    status: "scheduled",
    scheduledAt: new Date("2023-08-15T09:00:00Z"),
    totalRecipients: 1,
    sentCount: 0,
    failedCount: 0,
    createdBy: null // Will be replaced with actual user ID
  }
];
const orders = [
  {
    orderId: "ord2001",
    customerId: "cust1001",
    amount: 350.75,
    items: [
      {
        productId: "prod101",
        name: "Wireless Headphones",
        quantity: 1,
        price: 299.99
      },
      {
        productId: "prod102",
        name: "Screen Protector",
        quantity: 2,
        price: 25.38
      }
    ],
    status: "completed",
    orderDate: new Date("2023-05-15")
  },
  {
    orderId: "ord2002",
    customerId: "cust1002",
    amount: 120.50,
    items: [
      {
        productId: "prod103",
        name: "Smart Watch",
        quantity: 1,
        price: 120.50
      }
    ],
    status: "completed",
    orderDate: new Date("2023-06-20")
  }
];
const commLogs = [
  {
    campaignId: null, // Will be replaced
    customerId: "cust1001",
    message: "Enjoy 20% off on all summer collection!",
    status: "delivered",
    statusDetails: "Successfully delivered to email",
    sentAt: new Date("2023-06-01T10:00:00"),
    deliveredAt: new Date("2023-06-01T10:02:30")
  },
  {
    campaignId: null, // Will be replaced
    customerId: "cust1002",
    message: "Enjoy 20% off on all summer collection!",
    status: "failed",
    statusDetails: "Invalid phone number",
    sentAt: new Date("2023-06-01T10:05:00")
  }
];
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await Customer.deleteMany({});
    await Order.deleteMany({});
    await AudienceSegment.deleteMany({});
    await Campaign.deleteMany({});
    await CommunicationLog.deleteMany({});

    // Insert customers
    const insertedCustomers = await Customer.insertMany(customers);
    
    // Insert orders
    await Order.insertMany(orders);
    
    // Insert segments
    const insertedSegments = await AudienceSegment.insertMany(segments);
    
    // Insert campaigns with segment reference
    const insertedCampaigns = await Campaign.insertMany([
      {
        ...campaigns[0],
        segmentId: insertedSegments[0]._id
      }
    ]);
    
    // Insert communication logs with campaign reference
    await CommunicationLog.insertMany([
      {
        ...commLogs[0],
        campaignId: insertedCampaigns[0]._id
      },
      {
        ...commLogs[1],
        campaignId: insertedCampaigns[0]._id
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();