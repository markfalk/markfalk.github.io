---
slug: github-actions-ftw
title: GitHub Actions FTW?
authors: [mark]
tags: [github, ci-cd]
---

Converting the build and deploy process to use github actions.  Let's see if it worked.

Followed these docs:

* https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow

<!-- truncate -->

Let's see how this goes.

### Follow-up

It worked great!

Added the two workflow files in this [commit](https://github.com/markfalk/markfalk.github.io/commit/533f7792c845de6224c9114ddfaf27e8e2967f70#diff-28802fbf11c83a2eee09623fb192785e7ca92a3f40602a517c011b947a1822d3).

I discovered that I needed to commit a `yarn.lock` file in order for the workflow to succeed. Previously I had been using `npm` to build and test, but the supplied workflow uses `yarn`.

import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

<ThemedImage
  sources={{
    light: useBaseUrl('/img/blog/github-actions-light.png'),
    dark: useBaseUrl('/img/blog/github-actions-dark.png'),
  }}
  alt="Actions Workflow in Action"
/>
