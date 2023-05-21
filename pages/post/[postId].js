import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0"

import { AppLayout } from "../../components/AppLayout"
import clientPromise from "../../lib/mongodb"
import { ObjectId } from "mongodb"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHashtag } from "@fortawesome/free-solid-svg-icons"

export default function Post(props) {
  console.log("PROPS: ", props)
  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
          <div className="mt-2"> {props.metaDescription}</div>
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Keywords
        </div>
        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, i) => (
            <div className="p-2 rounded-full bg-slate-600 text-white" key={i}>
              <FontAwesomeIcon icon={faHashtag} />
              {keyword}
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Blog post
        </div>
        <div dangerouslySetInnerHTML={{ __html: props.postContent || "" }} />
      </div>
    </div>
  )
}

Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    // const props = await getAppProps(ctx)
    const userSession = await getSession(ctx.req, ctx.res)
    const client = await clientPromise
    const db = client.db("BlogGenerator")
    const user = await db.collection("users").findOne({
      auth0Id: userSession.user.sub,
    })
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(ctx.params.postId),
      userId: user._id,
    })

    if (!post) {
      return {
        redirect: {
          destination: "/post/new",
          permanent: false,
        },
      }
    }

    return {
      props: {
        id: ctx.params.postId,
        postContent: post.postContent,
        title: post.title,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        postCreated: post.created.toString(),
        // ...props,
      },
    }
  },
})

// export const getServerSideProps =
//   withPageAuthRequired()
// () => {
//   return {
//     props: {},
//   }
// }
// {
// async getServerSideProps(ctx) {
//   const userSession = await getSession(ctx.req, ctx.res, )
//   const client = await clientPromise
//   const db = client.db("BlogGenerator")
//   const user = await db.collection("users").findOne({
//     auth0Id: userSession.user.sub,
//   })
//   const post = await db.collection("posts").findOne({
//     _id: new ObjectId(ctx.params.postId),
//     userId: user._id,
//   })
//   if (!post) {
//     return {
//       redirect: {
//         destination: "/post/new",
//         permanent: false,
//       },
//     }
//   }
//   return {
//     props: {
//       postContent: post.postContent,
//       title: post.title,
//       metaDescription: post.metaDescription,
//       keywords: post.keywords,
//     },
//   }
// },
// }
