import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Alternative() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Urban Intellect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          New Route Example.
        </h1>

      </main>
    </div>
  );
}