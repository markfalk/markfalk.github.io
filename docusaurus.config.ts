import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import mermaid from 'mermaid';

mermaid.registerIconPacks([
  {
    name: 'logos',
    loader: () => import('@iconify-json/logos').then((module) => module.icons),
  },
]);

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mark Falk',
  tagline: 'Let\'s build something awesome together!',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://markfalk.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'markfalk', // Usually your GitHub org/user name.
  projectName: 'markfalk.github.io', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          remarkPlugins: [
            [
              require('@docusaurus/remark-plugin-npm2yarn'),
              {converters: ['yarn'],
                sync: true,
              },
            ],
          ],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'daily',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/social-media-card.png',
    navbar: {
      title: 'Mark Falk',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'selfHostingSidebar',
          position: 'left',
          label: 'Self-Hosting',
        },
        {
          type: 'docSidebar',
          sidebarId: 'interestingTechSidebar',
          position: 'left',
          label: 'Interesting Tech',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'selfHostingSidebar',
        //   position: 'left',
        //   label: 'Self Hosting Not Manual',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'tutorialSidebar',
        //   position: 'left',
        //   label: 'Tutorial',
        // },
        {to: '/blog', label: 'Blog', position: 'left'},
        // {
        //   href: 'https://github.com/facebook/docusaurus',
        //   label: 'GitHub',
        //   position: 'right',
        // },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'AsdfSidebar',
        //   label: 'Test',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Self-Hosting',
              to: '/docs/self-hosting/',
            },
            {
              label: 'Interesting Tech',
              to: '/docs/interesting-tech',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/markfalk/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Listovus LLC.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript'],
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    metadata: [
      { name: 'keywords', content: 'Mark Falk, SRE, DevOps, Infrastructure, Self-Hosting, Systems Administration' },
      { name: 'author', content: 'Mark Falk' },
      { name: 'description', content: 'Thoughts and projects by Mark Falk, technologist, SRE, and self-hosting enthusiast.' },
      { property: 'og:title', content: 'Mark Falk - Technologist, SRE, and Self-Hosting Enthusiast' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://markfalk.github.io/' },
      { property: 'og:description', content: 'Exploring infrastructure, reliability, and self-hosting.' },
      { property: 'og:image', content: 'https://markfalk.github.io/img/social-media-card.png  ' },
    ],
  } satisfies Preset.ThemeConfig,
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  plugins: [
    async function myPlugin(context, options) {
      return {
        name: 'custom-meta-tags',
        injectHtmlTags() {
          return {
            headTags: [
              {
                tagName: 'meta',
                attributes: {
                  name: 'google-site-verification',
                  content: '74K8gH24pwiVfErmqrneIteAIeZk0Mj-3ZZCUiAznO8',
                },
              },
            ],
          };
        },
      };
    },
  ],
};

export default config;
