import httpClient from '~/libs/httpClient';
export const getHubApi = async (filter) => {
    try {
        const response = await httpClient.get("/hubs", {
            params: filter
        });
        return Promise.resolve(response.data);
    } catch (error) {
        return Promise.reject(error);
    }
};