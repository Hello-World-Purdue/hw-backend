import Server from './server';

export const start = async () => {
	try {
		const server = await Server.createServerInstance();
		await server.start();
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
};

start();
