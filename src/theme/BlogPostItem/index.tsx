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
