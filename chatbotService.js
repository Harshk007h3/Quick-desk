const OpenAI = require('openai');
const { Configuration } = require('@openai/api');
const { getAnalytics, getPriorityDistribution, getPerformanceAnalytics } = require('./analyticsService');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAI(configuration);

const chatbotService = {
    async getResponse(message) {
        try {
            // Get analytics context
            const analytics = await getAnalytics();
            const priorityDistribution = await getPriorityDistribution();
            const performance = await getPerformanceAnalytics();
            const agentPerformance = await getAgentPerformanceAnalytics();
            
            // Prepare context for the chatbot
            const context = `You are a helpful support assistant. Here are some analytics about the helpdesk:
            - Total tickets: ${analytics.totalTickets}
            - Open tickets: ${analytics.openTickets}
            - Average response time: ${analytics.averageResponseTime} minutes
            - Priority distribution: ${priorityDistribution.map(p => `${p.priority}: ${p.percentage}%`).join(', ')}
            - Performance score: ${performance.performanceScore}%
            - Average resolution time: ${performance.avgResolutionTime} minutes
            
            Agent-specific analytics:
            - Agent performance score: ${agentPerformance.performanceScore}%
            - Agent average response time: ${agentPerformance.avgResponseTime} minutes
            - Agent average resolution time: ${agentPerformance.avgResolutionTime} minutes
            - Tickets resolved today: ${agentPerformance.resolvedToday}
            
            Performance targets:
            - Target performance score: 90%
            - Target daily resolved tickets: 5
            - Target response time: 30 minutes
            - Target resolution time: 120 minutes
            
            Please provide helpful responses based on this context and the user's message. Consider the current priority distribution, performance metrics, and agent-specific statistics when suggesting actions. If the agent's performance is below target, suggest ways to improve it based on the specific metrics that are lagging.`;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: context },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 200
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Chatbot service error:', error);
            throw new Error('Failed to get chatbot response');
        }
    },

    async getFaqTopics() {
        try {
            const analytics = await getAnalytics();
            const agentPerformance = await getAgentPerformanceAnalytics();
            
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a support assistant. Generate a list of common FAQ topics for a helpdesk system. Consider the current analytics:
                    - Total tickets: ${analytics.totalTickets}
                    - Open tickets: ${analytics.openTickets}
                    - Priority distribution: ${analytics.priorityDistribution.map(p => `${p.priority}: ${p.percentage}%`).join(', ')}
                    - Common issues: ${analytics.mostCommonIssues.join(', ')}
                    - Agent performance: ${agentPerformance.performanceScore}%
                    - Agent response time: ${agentPerformance.avgResponseTime} minutes
                    
                    Focus on topics that would help improve agent performance and address current system bottlenecks.` },
                    { role: "user", content: "Please generate a list of 10 relevant FAQ topics based on the current helpdesk situation." }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Failed to get FAQ topics:', error);
            throw new Error('Failed to generate FAQ topics');
        }
    },

    async getFaqAnswer(topic) {
        try {
            const analytics = await getAnalytics();
            const agentPerformance = await getAgentPerformanceAnalytics();
            
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a support assistant. Provide a detailed answer to the following FAQ question. Consider the current helpdesk situation:
                    - Total tickets: ${analytics.totalTickets}
                    - Open tickets: ${analytics.openTickets}
                    - Priority distribution: ${analytics.priorityDistribution.map(p => `${p.priority}: ${p.percentage}%`).join(', ')}
                    - Common issues: ${analytics.mostCommonIssues.join(', ')}
                    - Agent performance: ${agentPerformance.performanceScore}%
                    - Agent response time: ${agentPerformance.avgResponseTime} minutes
                    
                    Tailor your response to help improve agent performance and address current system bottlenecks.` },
                    { role: "user", content: topic }
                ],
                temperature: 0.7,
                max_tokens: 250
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Failed to get FAQ answer:', error);
            throw new Error('Failed to get FAQ answer');
        }
    },

    async getKnowledgeBaseSearch(query) {
        try {
            const analytics = await getAnalytics();
            const agentPerformance = await getAgentPerformanceAnalytics();
            
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a support assistant. Search our knowledge base for relevant information about the user's query. Consider the current helpdesk situation:
                    - Total tickets: ${analytics.totalTickets}
                    - Open tickets: ${analytics.openTickets}
                    - Priority distribution: ${analytics.priorityDistribution.map(p => `${p.priority}: ${p.percentage}%`).join(', ')}
                    - Common issues: ${analytics.mostCommonIssues.join(', ')}
                    - Agent performance: ${agentPerformance.performanceScore}%
                    - Agent response time: ${agentPerformance.avgResponseTime} minutes
                    
                    Focus on results that can help improve agent performance and address current system bottlenecks.` },
                    { role: "user", content: `Search our knowledge base for information about: ${query}` }
                ],
                temperature: 0.7,
                max_tokens: 250
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('Failed to search knowledge base:', error);
            throw new Error('Failed to search knowledge base');
        }
    }
};

module.exports = chatbotService;
