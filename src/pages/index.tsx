import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Home"
      description="Mark Falk | Technologist, SRE, and Self-Hosting Enthusiast"
    >
      <main className={clsx('hero', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">Systems, Tools, and the Joy of Figuring Things Out</h1>
          <p className="hero__subtitle">
            Hi, I'm Mark Falk — a Site Reliability Engineer with a background in DevOps, Networking, and Software Development.
          </p>
          <p className={styles.intro}>
            I've been building reliable production systems for years, long before I officially held the SRE title. Now, I use this space to share my insights, technical projects, and experiments in infrastructure, observability, and automation.
          </p>
        </div>
      </main>

      <div className="container margin-vert--lg">
        <section>
          <h2>📬 Latest Article</h2>
          <p>
            <strong>
              <a href="/docs/self-hosting-mail" target="_blank" rel="noopener noreferrer">
                Self-Hosting Email with Stalwart Mail and AWS
              </a>
            </strong>
            <br />
            A deep dive into setting up your own email server with Docker, Stalwart Mail, and an AWS-based relay system. Includes DNS configuration, security, and operational details.
          </p>
        </section>

        <section className="margin-top--lg">
          <h2>🧭 What to Expect</h2>
          <ul>
            <li>Self-hosting and homelab architecture</li>
            <li>Docker and container orchestration</li>
            <li>CI/CD and automation workflows</li>
            <li>Monitoring and observability tools</li>
            <li>Interesting developments in tech</li>
          </ul>
        </section>

        <section className="margin-top--lg">
  <h2>👔 About Me</h2>
  <p>
    I'm Mark Falk, a Site Reliability Engineer with a background in DevOps, Networking, and Systems Administration.
    While I'm relatively new to the formal title of SRE, I've spent years designing and operating reliable production systems
    with a strong focus on observability, automation, and reducing operational toil.
  </p>
  <p>
  I got my start writing software in C and Java, and I've always been drawn to understanding how things work under the hood—whether it's the kernel, a network protocol, or the internals of a database. 
  That curiosity has shaped the way I approach systems: with attention to performance, reliability, and the often-overlooked details that make things tick.
</p>  <p>
    This site serves as a living record of my technical journey—documenting what I'm building, how I'm thinking, and what I'm learning along the way.
    I'm currently exploring new opportunities and open to roles that align with my values and skills.
  </p>
</section>
      </div>
    </Layout>
  );
}
