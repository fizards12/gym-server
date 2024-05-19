import {createClient} from 'redis';
import { redisPassword, redisURI, redisUser } from './env';

export const client = createClient({
    username: redisUser,
    password: redisPassword,
    socket: {
        host: redisURI,
        port: 11708,
        timeout:6000 
    }
});

client.on('error', (err: Error) => {
    console.error('Redis error:', err);
})

export const connectRedis = async () => {
    try {
      if (!client.isOpen) {
        await client.connect();
        console.log('Connected to Redis!');
      }
    } catch (err) {
        console.log(err);
    }
  };

export async function cacheRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
        await client.setEx(userId.toString(), 60 * 60 * 24, refreshToken);
    } catch (error) {
        throw error
    }
}

export async function getRefreshToken(userId: number): Promise<string | null> {
    try {
        const refreshToken = await client.get(userId.toString());
        return refreshToken;
    } catch (error) {
        console.error('Error retrieving refresh token:', error);
        throw error;
    }


}

export async function deleteRefreshToken(userId: number): Promise<void> {
    try {
        await client.del(userId.toString());
    } catch (error) {
        throw error;
    }
}