import { Axios } from 'axios';

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
    const axios = new Axios({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(githubAccessToken && {
          Authorization: `Bearer ${githubAccessToken}`,
        }),
      },
      responseType: 'json',
    });

    const result = await axios.get(
      `/repos/${githubRepo}/contents/${vapiName}/docs.yml?ref=${githubBranch}`,
    );
    return result.data;
  } catch (error) {
    throw error;
  }
};
