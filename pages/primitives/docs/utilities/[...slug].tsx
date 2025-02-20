import React from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { TitleAndMetaTags } from '@components/TitleAndMetaTags';
import { MDXProvider, components } from '@components/MDXComponents';
import { QuickNav } from '@components/QuickNav';
import { OldVersionNote } from '@components/OldVersionNote';
import { getAllFrontmatter, getAllVersionsFromPath, getMdxBySlug } from '@utils/mdx';
import { getPackageData, formatBytes } from '@utils/bundlephobia';

import type { Frontmatter } from 'types/frontmatter';
import type { GetStaticPropsContext } from 'next';

type Doc = {
  frontmatter: Frontmatter;
  code: any;
};

export default function UtilitiesDoc({ frontmatter, code }: Doc) {
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <>
      <div data-algolia-lvl0 style={{ display: 'none' }}>
        Utilities
      </div>

      <TitleAndMetaTags
        title={`${frontmatter.metaTitle} – Radix Primitives`}
        description={frontmatter.metaDescription}
        image="primitives.png"
      />

      {frontmatter.version !== frontmatter.versions?.[0] && (
        <OldVersionNote
          name={frontmatter.metaTitle}
          href={`/primitives/docs/utilities/${frontmatter.slug.replace(frontmatter.version!, '')}`}
        />
      )}

      <MDXProvider frontmatter={frontmatter}>
        <Component components={components as any} />
      </MDXProvider>

      <QuickNav key={frontmatter.slug} />
    </>
  );
}

export async function getStaticPaths() {
  const frontmatters = getAllFrontmatter('primitives/docs/utilities');

  return {
    paths: frontmatters.map((frontmatter) => ({
      params: { slug: frontmatter.slug.replace('primitives/docs/utilities/', '').split('/') },
    })),
    fallback: false,
  };
}

export async function getStaticProps(context: GetStaticPropsContext<{ slug: string[] }>) {
  const slugs = context.params?.slug ? context.params.slug : [];
  const slug = slugs.join('/');
  const { frontmatter, code } = await getMdxBySlug('primitives/docs/utilities/', slug);
  const [componentName, componentVersion] = slugs;

  const packageData = frontmatter.name
    ? await getPackageData(frontmatter.name, componentVersion).catch(() => null)
    : null;

  const extendedFrontmatter = {
    ...frontmatter,
    version: componentVersion,
    versions: getAllVersionsFromPath(`primitives/docs/utilities/${componentName}`),
    gzip: typeof packageData?.gzip === 'number' ? formatBytes(packageData.gzip) : null,
  };

  return { props: { frontmatter: extendedFrontmatter, code } };
}
