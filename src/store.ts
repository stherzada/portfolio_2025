import { reactive } from 'vue'

const store = reactive({
    blogPosts: [
        {
            id: 1,
            title: 'Blog Post 1',
            description: 'This is the first blog post',
            date: new Date(),
        },
        {
            id: 2,
            title: 'Blog Post 2',
            description: 'This is the second blog post',
            date: new Date(),
        },
        {
            id: 3,
            title: 'Blog Post 3',
            description: 'This is the third blog post',
            date: new Date(),
        },
        ],
    })

export default store;