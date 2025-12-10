import api from './api';

export const bannerService= {
    getAll: async ()=> {
        const response=await api.get('/banners');
        return response.data.data;
    }

    ,

    getActive: async (type, position)=> {
        const params=new URLSearchParams();
        if (type) params.append('type', type);
        if (position) params.append('position', position);

        const response=await api.get(`/banners/active?$ {
                params.toString()
            }

            `);
        return response.data.data;
    }

    ,

    create: async (data)=> {
        const response=await api.post('/banners', data);
        return response.data.data;
    }

    ,

    update: async (id, data)=> {
        const response=await api.put(`/banners/$ {
                id
            }

            `, data);
        return response.data.data;
    }

    ,

    delete: async (id)=> {
        await api.delete(`/banners/$ {
                id
            }

            `);
    }

    ,
}

;