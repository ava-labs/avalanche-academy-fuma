import { ArrowUpRightIcon } from '@heroicons/react/20/solid';
import type { Metadata } from 'next';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { utils, type Page } from '@/utils/source';
import { createMetadata } from '@/utils/metadata';
import Preview from '@/components/preview';
import Link from "next/link";

interface Param {
  slug: string[];
}

export const dynamicParams = false;

function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatter.format(date); // 1 January 2021
}

export default function Page({
  params,
}: {
  params: Param;
}): React.ReactElement {
  const page = utils.getPage(params.slug);

  if (!page) notFound();

  const path = `content/course/${page.file.path}`;
  const preview = page.data.preview;

  // Adding Date Formatting on Right Sidebar
  const updated = new Date(page.data.updated);
  const [updatedISO, updatedHuman] = [updated.toISOString(), formatDate(updated)];

  return (
    <DocsPage
      toc={page.data.exports.toc}
      lastUpdate={page.data.exports.lastModified}
      tableOfContent={{
        header: (
          <div className="flex flex-col gap-6">
            {/*
              <div className="bg-secondary/50 rounded-lg border border-border p-4 text-sm">
                This space will be used for right sidebar action items during lessons.{" "}
              </div>
            */}
            <div className="grid grid-cols-3 text-sm gap-y-4 text-muted-foreground">
              <div>Author{page.data.authors.length > 1 ? "s" : ""}:</div>
              <div className="col-span-2 flex flex-col gap-2">
                {page.data.authors.map(author => (
                  <Link
                    key={author}
                    href={`https://github.com/${author}`}
                    className="text-foreground transition-colors flex flex-row items-center gap-2 group"
                  >
                    <img
                      src={`https://github.com/${author}.png?size=16`}
                      className="w-4 h-4 rounded-full border border-background group-hover:border-muted-foreground transition-colors"
                    />
                    <span className="flex-grow truncate">{author}</span>
                  </Link>
                ))}
              </div>
              <div>Updated:</div>
              <time dateTime={updatedISO} title={updatedISO} className="col-span-2 text-foreground">
                {updatedHuman}
              </time>
            </div>
          </div>
        ),
        enabled: page.data.toc,
        footer: (
          <a
            href={`https://github.com/ava-labs/avalanche-academy/blob/main/${path}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Edit on Github <ArrowUpRightIcon className="size-5" />
          </a>
        ),
      }}
    >
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
        {page.data.title}
      </h1>
      <p className="mb-8 text-lg text-muted-foreground">
        {page.data.description}
      </p>
      <DocsBody>
        {preview && preview in Preview ? Preview[preview] : null}
        {page.data.index ? (
          <Category page={page} />
        ) : (
          <page.data.exports.default />
        )}
      </DocsBody>
    </DocsPage>
  );
}

function Category({ page }: { page: Page }): React.ReactElement {
  const filtered = utils
    .getPages()
    .filter(
      (item) =>
        item.file.dirname === page.file.dirname && item.file.name !== 'index',
    );

  return (
    <Cards>
      {filtered.map((item) => (
        <Card
          key={item.url}
          title={item.data.title}
          description={item.data.description ?? 'No Description'}
          href={item.url}
        />
      ))}
    </Cards>
  );
}

export function generateMetadata({ params }: { params: Param }): Metadata {
  const page = utils.getPage(params.slug);

  if (!page) notFound();

  const description =
    page.data.description ?? 'Learn how to build on Avalanche blockchain with Academy';

  const imageParams = new URLSearchParams();
  imageParams.set('title', page.data.title);
  imageParams.set('description', description);

  const image = {
    alt: 'Banner',
    url: `/api/og/${params.slug[0]}?${imageParams.toString()}`,
    width: 1200,
    height: 630,
  };

  return createMetadata({
    title: page.data.title,
    description,
    openGraph: {
      url: `/docs/${page.slugs.join('/')}`,
      images: image,
    },
    twitter: {
      images: image,
    },
  });
}

export function generateStaticParams(): Param[] {
  return utils.getPages().map<Param>((page) => ({
    slug: page.slugs,
  }));
}
