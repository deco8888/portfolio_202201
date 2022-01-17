import React from 'react';
import Head from 'next/head';
import { client } from 'libs/client';
import type { Options, ListContentsResponse } from '../types/index';
export default function Home({ portfolio }: { [key: string]: Options[] }): JSX.Element {
    return (
        <>
            <Head>
                <title>Portfolio | Ayaka Nakamura</title>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
                <meta name="description" content="" />
                <meta property="og:locale" content="ja_JP" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="" />
                <meta property="og:description" content="" />
                <meta property="og:url" content="" />
                <meta property="og:image" content="" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href="" />
            </Head>
            <div>
                <ul>
                    {portfolio.map(
                        (work: Options): JSX.Element => (
                            <li key={work.id}>
                                <p>{work.title}</p>
                            </li>
                        )
                    )}
                </ul>
            </div>
        </>
    );
}

export const getStaticProps = async () => {
    const data: ListContentsResponse<Options[]> = await client.get({ endpoint: 'portfolio' });
    return {
        props: {
            portfolio: data.contents,
        },
    };
};
