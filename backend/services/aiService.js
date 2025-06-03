const axios = require('axios');

class AIService {
    static async convertTextToSegmentRules(text) {
        // Using OpenAI API for natural language processing
        const prompt = `Convert this customer segment description into logical rules in JSON format:
        Description: ${text}
        Example output format: 
        {
            "rules": [
                {
                    "field": "totalSpend",
                    "operator": ">",
                    "value": 10000
                },
                {
                    "condition": "AND",
                    "field": "lastPurchaseDate",
                    "operator": "<",
                    "value": "90 days ago"
                }
            ]
        }`;
        
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return JSON.parse(response.data.choices[0].message.content);
        } catch (error) {
            console.error('AI Service Error:', error);
            throw new Error('Failed to process natural language segment');
        }
    }
}

module.exports = AIService;