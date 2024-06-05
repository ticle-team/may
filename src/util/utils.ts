import { Octokit } from '@octokit/core';

type PropsAxios = {
  githubRepo: string;
  githubBranch: string;
  vapiName: string;
  githubAccessToken?: string;
};

export const getVapiDocs = async ({
  githubRepo,
  githubBranch,
  vapiName,
  githubAccessToken,
}: PropsAxios) => {
  if (!githubRepo || !vapiName) return '';

  try {
    const octokit = new Octokit({
      auth: githubAccessToken,
    });

    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}?ref={ref}',
      {
        owner: githubRepo.split('/')[0],
        repo: githubRepo.split('/')[1],
        path: `${vapiName}/docs.yml`,
        ref: githubBranch,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    return Buffer.from(data.content, 'base64').toString('utf8');
  } catch (error) {
    throw error;
  }
};
