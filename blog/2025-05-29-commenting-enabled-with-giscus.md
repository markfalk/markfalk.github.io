---
slug: commenting-enabled-with-giscus
title: Commenting Enabled with Giscus
description: "Commenting Enabled with Giscus"
authors: [mark]
tags: [giscus, docusaurus]
---

I've enabled comments on the blog using [giscus](https://giscus.app)! Super easy to set up. I stumbled across
[this post](https://dev.to/m19v/how-to-add-giscus-comments-to-docusaurus-439h) showing how to add giscus to
a Docusaurus site.

👇👇👇 Installation Notes Below 👇👇👇
<!-- truncate -->

I was hoping to add a comment section to engage with any readers, and now I have.  I've used
Disqus as a user in the past, but never added it as a widget. Giscus is a great alternative.

The instructions at the aforementioned [post](https://dev.to/m19v/how-to-add-giscus-comments-to-docusaurus-439h) got me 90% of the way there.

I ran into an issue since I'm using Docusaurus 3.x and the post was written against 2.x which meant I needed to swap
out `import BlogPostItem from '@theme-original/BlogPostItem';` with `import BlogPostItem from '@docusaurus/plugin-content-blog/client';`
and modify the `BlogPostItemWrapper` function slightly.  Here are the steps I followed.

```bash npm2yarn
npm i @giscus/react
npm run swizzle @docusaurus/theme-classic BlogPostItem -- --wrap
```

```txt title="Example Run"
>yarn add @giscus/react
yarn add v1.22.22
[1/5] 🔍  Validating package.json...
[2/5] 🔍  Resolving packages...
[3/5] 🚚  Fetching packages...
[4/5] 🔗  Linking dependencies...
[5/5] 🔨  Building fresh packages...
success Saved lockfile.
success Saved 4 new dependencies.
info Direct dependencies
└─ @giscus/react@3.1.0
info All dependencies
├─ @giscus/react@3.1.0
├─ giscus@1.6.0
├─ lit-element@4.2.0
└─ lit@3.3.0
✨  Done in 4.65s.

>yarn swizzle @docusaurus/theme-classic BlogPostItem --wrap
yarn run v1.22.22
$ docusaurus swizzle @docusaurus/theme-classic BlogPostItem --wrap
✔ Which language do you want to use? › TypeScript
[WARNING]
Swizzle action wrap is unsafe to perform on BlogPostItem.
It is more likely to be affected by breaking changes in the future
If you want to swizzle it, use the `--danger` flag, or confirm that you understand the risks.

✔ Do you really want to swizzle this unsafe internal component? › YES: I know what I am doing!
[SUCCESS]
Created wrapper of BlogPostItem from @docusaurus/theme-classic in
- "/markfalk.github.io/src/theme/BlogPostItem/index.tsx"
```

I created a new GitHub repository to hold the comments and enabled discussions as described in the original post.

Using the [GraphQL API Explorer](https://docs.github.com/en/graphql/overview/explorer) with the following query:

```graphql
query { 
  repository(owner: "nameOfYourGitHubAccount", name:"nameOfCreatedRepository"){
    id
    discussionCategories(first:10) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}
```

I determined the proper values for `repoId` and `categoryId`.

I created the component file `/src/components/GiscusComponent.tsx` (I use TypeScript)

```typescript title=src/components/GiscusComponent.tsx
import React from 'react';
import Giscus from "@giscus/react";
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    <Giscus    
      repo="markfalk/giscus-data"
      repoId="R_kgDOOyyeKA"                // Replace - from GraphQL API Explorer
      category="General"
      categoryId="DIC_kwDOOyyeKM4CqwgG"    // Replace - from GraphQL API Explorer / E.g. id of "General"
      mapping="url"
      term="Welcome to @giscus/react component!"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="top"
      theme={colorMode}
      lang="en"
      loading="lazy"
    />
  );
}
```

I modified `src/theme/BlogPostItem/index.tsx` as instructed. I also wanted comments on by default on all blog posts, they can be disabled by adding `enableComments: false` to the blog frontmatter.

```typescript title="src/theme/BlogPostItem/index.tsx"
import React, {type ReactNode} from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import type BlogPostItemType from '@theme/BlogPostItem';
import type {WrapperProps} from '@docusaurus/types';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client'
import GiscusComponent from '@site/src/components/GiscusComponent';
import useIsBrowser from '@docusaurus/useIsBrowser';


type Props = WrapperProps<typeof BlogPostItemType>;

/**
 * Wraps the original BlogPostItem with an additional Giscus comment component when
 * the blog post is viewed as a single page and comments are enabled for the post.
 * @param props The original props passed to BlogPostItem
 * @returns The wrapped BlogPostItem component
 */
export default function BlogPostItemWrapper(props: Props): ReactNode {
  const { metadata, isBlogPostPage } = useBlogPost()
  const isBrowser = useIsBrowser();

  const { frontMatter } = metadata
  const { enableComments = true } = frontMatter

  return (
    <>
      <BlogPostItem {...props} />
      {(enableComments && isBlogPostPage) && (
        <GiscusComponent />
      )}
    </>
  );
}
```

```txt title="FrontMatter Example"
---
slug: commenting-enabled-with-giscus
title: Commenting Enabled with Giscus
description: "Commenting Enabled with Giscus"
authors: [mark]
tags: [giscus, docusaurus]
enableComments: false
---
```

Feel free to leave a comment! <span style={{ fontSize: "28px" }}>😉</span>
