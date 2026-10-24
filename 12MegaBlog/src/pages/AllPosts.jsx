import { useEffect, useState } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";

function AllPosts() {
    const [posts, setPosts] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        let isMounted = true

        appwriteService.getPosts([])
            .then((result) => {
                if (isMounted) setPosts(result.rows)
            })
            .catch((requestError) => {
                console.error("Failed to load posts:", requestError)
                if (isMounted) setError(requestError?.message || "Posts could not be loaded.")
            })

        return () => {
            isMounted = false
        }
    }, [])

  return (
    <div className='w-full py-8'>
        <Container>
            {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
            <div className='flex flex-wrap'>
                {posts.map((post) => (
                    <div key={post.$id} className='p-2 w-1/4'>
                        <PostCard {...post} />
                    </div>
                ))}
            </div>
            </Container>
    </div>
  )
}

export default AllPosts