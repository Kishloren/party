// const socket = io('http://localhost:7780');
const socket = io('https://www.stansgames.fr', {
    path: '/party/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnectionAttempts: 5
});