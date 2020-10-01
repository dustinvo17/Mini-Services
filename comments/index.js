const express = require('express')
const bodyParser = require('body-parser')
const {randomBytes} = require('crypto')
const cors = require('cors')
const  axios = require('axios')
const app = express()
const commentsByPostId = {
    
}
app.use(bodyParser.json())
app.use(cors())


app.get('/posts/:id/comments',(req,res) => {
    res.send(commentsByPostId[req.params.id] || [])
})
app.post('/posts/:id/comments',async  (req,res) => {
    const comment_id = randomBytes(4).toString('hex')
    const post_id = req.params.id
    const {content} = req.body
    const comments = commentsByPostId[post_id] || []
    comments.push({id:comment_id,content,status:'pending'})
    commentsByPostId[post_id] = comments
    await axios.post('http://localhost:4005/events',{
        type:"CommentCreated",
        data:{
            id:comment_id,
            content,
            postId:post_id,
            status:'pending'

        }
    })
    res.status(201).send(comments)
})
app.post('/events', async (req,res) => {
    console.log('Event Received',req.body.type)
    const {type,data} = req.body
    if(type === 'CommentModerated'){
        const {id,postId,status,content} = data
        const comments = commentsByPostId[postId]
        const comment = comments.find(c => c.id == id)
        comment.status = status
        await axios.post('http://localhost:4005/events',{
            type:"CommentUpdated",
            data: {
                id,
                postId,
                status,
                content
            }
        })
    }
})
app.listen(4001,(req,res) => {
    console.log('Running on 4001')
})