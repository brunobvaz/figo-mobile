import { mockSellers } from './mockUsers';

export default [
    {
        id: 'conversation-1',
        seller: mockSellers[0],
        productId: 'p1',
        productTitle: 'Tomate coração de boi',
        lastMessage: 'Sim, ainda tenho disponível para amanhã.',
        timestamp: '18:42',
        unreadCount: 2,
        messages: [
            { id: 'message-1', text: 'Olá! Ainda tem tomate disponível?', sender: 'buyer' },
            { id: 'message-2', text: 'Sim, ainda tenho disponível para amanhã.', sender: 'seller' }
        ]
    },
    {
        id: 'conversation-2',
        seller: mockSellers[1],
        productId: 'p2',
        productTitle: 'Mel artesanal',
        lastMessage: 'Obrigado, passo aí ao final da tarde.',
        timestamp: 'Ontem',
        unreadCount: 0,
        messages: [
            { id: 'message-3', text: 'Consigo levantar a encomenda hoje?', sender: 'buyer' },
            { id: 'message-4', text: 'Sim, a partir das 17h.', sender: 'seller' },
            { id: 'message-5', text: 'Obrigado, passo aí ao final da tarde.', sender: 'buyer' }
        ]
    },
    {
        id: 'conversation-3',
        seller: mockSellers[2],
        productId: 'p7',
        productTitle: 'Queijo artesanal',
        lastMessage: 'O queijo pesa aproximadamente 500 g.',
        timestamp: '30 ago.',
        unreadCount: 0,
        messages: [
            { id: 'message-6', text: 'Qual é o peso aproximado do queijo?', sender: 'buyer' },
            { id: 'message-7', text: 'O queijo pesa aproximadamente 500 g.', sender: 'seller' }
        ]
    }
];
