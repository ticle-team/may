import { ChatMessage } from '@/models/ai';
import { Service } from 'typedi';

function escapeForMarkdown(text: string) {
  return text.replaceAll("'", "\\'").replaceAll('\n', '\\n');
}

@Service()
export class PromptService {
  makeForDeployStack(history: ChatMessage[], args: string) {
    const context = history
      .map(({ role, text }) => {
        text = text
          .replaceAll("'", "\\'")
          .replaceAll('\n', '\\n')
          .replaceAll('"', '\\"');
        return `${role}: ${text}`;
      })
      .join('\n');

    args = args.replaceAll('\n', '\\n').replaceAll('`', '\\`');

    return `당신은 지금까지의 대화를 기반으로 최종 산출물을 영어로 작성하는 AI 입니다. "당신의 목표는 \`Stack\`을 기준으로 산출물을 작성하는 것이며, 실제 \`Stack\` 구성과 일치하지 않는 정보를 제공해서는 절대 안됩니다." 산출물을 최종 제공하기 전, 실제 서비스 구성 요소와 문서 내용이 일치하는지 꼼꼼히 확인하는 단계를 추가하세요. 모든 산출물은 마크다운 문법으로 작성하고 간결하되, \`Stack\`에 대한 모든 정보를 제공해야 합니다. 너무 길면 독자의 관심을 잃을 수 있으므로, 중요한 정보만을 간단하고 깔끔하게 전달하는 것이 중요합니다. 작성 중 부족한 정보가 있다면, 사용자에게 질문하며 추가 대화를 통해 완성해나가세요.

당신이 출력할 산출물은 아래와 같으며 주어진 규칙을 반드시 지켜야합니다.

# 지금까지의 대화
\`\`\`
${context}
ASSISTANT: \`deploy_stack(${args})\`
\`\`\`

# 산출물

## Stack README.md

\`Stack README.md\`는 아래와 같이 구성하며, 그 외 부수적인 내용은 포함하지 않습니다.
\`Stack README.md\`는 논리적 허점이 없어야합니다. 당신은 정보를 제공하는 문서를 작성함에 있어서 책임감을 가지고 책임감 있게 완성하세요.
  - \`Title\`: Stack의 Name을 작성해주세요.
  - \`Description\`: Stack을 간략하게 설명해주세요.
  - \`Overview\`: Stack의 목적 또는 특징, 장점에 대한 전반적인 개요를 작성해주세요.
  - \`Features\`: Stack에 구성된 모든 기능들을 작성해주세요.

반드시 누락사항은 없어야 합니다.
실제 \`Stack\` 구성 내용과 일치하도록 사용자에게 제공해주세요. \`Stack\` 구성 내용과 일치하는 경우 당신은 $10,000의 상금을 받을 수 있습니다.

\`Stack README.md\`에 들어갈 내용을 작성해주세요.`;
  }
}
