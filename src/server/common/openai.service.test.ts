import { loadEnvConfig } from '@next/env';
import { Container } from 'typedi';
import { OpenAIAssistant, OpenAIChat } from '@/server/common/openai.service';
import { TextDeltaBlock } from 'openai/resources/beta/threads/messages';
import { getLogger } from '@/logger';
import { SystemMessage } from '@langchain/core/messages';

const logger = getLogger('openai.service.test.ts');

process.env = {
  ...process.env,
  ...loadEnvConfig(process.cwd(), true).combinedEnv,
};
describe('given openai assistant', () => {
  const stackCreationAssistantID =
    process.env.OPENAI_API_STACK_CREATION_ASSISTANT_ID || '';

  afterEach(() => {
    Container.reset();
  });

  it('when stack creation, then ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const resp = await openai.getAssistant(stackCreationAssistantID);

    expect(resp.id).toBe(stackCreationAssistantID);
  });

  it.skip('when stack creation though assistant, then response is ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(thread.id, '안녕하세요');
    expect(message.id).not.toBe('');

    const run = await openai.run(thread.id, assistant.id);
    expect(
      run.status,
      `lastError: ${run.last_error?.message}, code: ${run.last_error?.code}`,
    ).toBe('completed');

    const { messages } = await openai.getTextMessages(thread.id);
    const lastMessage = messages[0];
    expect(lastMessage.role).toBe('assistant');
    expect(lastMessage.text).not.toBe('');
    console.log(lastMessage.text);

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);

  it.skip('when stack creation through assistant and run stream with cancel, then answer is ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(thread.id, '안녕하세요');
    expect(message.id).not.toBe('');

    const stream = await openai.runStream(thread.id, assistant.id);
    const answers: string[] = [];
    let num = 0;
    for await (const { event, data } of stream) {
      switch (event) {
        case 'thread.message.created':
          console.log('text created');
          break;
        case 'thread.message.delta':
          const content = data.delta.content;
          expect(content).toBeDefined();

          for (const block of content!) {
            if (block.type !== 'text') {
              continue;
            }

            const { text } = block as TextDeltaBlock;
            console.log('text: ', text?.value);
            answers.push(text?.value ?? '');
          }
          num += 1;
          if (num == 2) {
            await stream.return();
          }
          break;
        case 'thread.message.completed':
          console.log('text done');
          break;
        case 'error':
          console.error(data);
          break;
      }
    }
    const answer = answers.join('');

    expect(answer).not.toBe('');

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  }, 10000);

  it.skip('when thread cancel when creating message, then ok', async () => {
    const openai = Container.get(OpenAIAssistant);
    const assistant = await openai.getAssistant(stackCreationAssistantID);
    expect(assistant.id).not.toBe('');
    const thread = await openai.createThread();
    expect(thread.id).not.toBe('');
    const message = await openai.createMessage(
      thread.id,
      'SNS 서비스를 만들어주고 기획서를 최대한 자세하게 작성해줘.',
    );
    expect(message.id).not.toBe('');

    const stream = await openai.runStream(thread.id, assistant.id);
    const answers: string[] = [];
    let cancelled = false;
    let num = 0;
    for await (const { event, data } of stream) {
      switch (event) {
        case 'thread.message.created':
          console.log('text created');
          break;
        case 'thread.message.delta':
          const content = data.delta.content;
          expect(content).toBeDefined();

          for (const block of content!) {
            if (block.type !== 'text') {
              continue;
            }

            const { text } = block as TextDeltaBlock;
            console.log('text: ', text?.value);
            answers.push(text?.value ?? '');
          }
          num += 1;
          if (num == 2) {
            await openai.cancel(thread.id);
          }
          break;
        case 'thread.message.completed':
          console.log('text done');
          break;
        case 'error':
          console.error(data);
          break;
        case 'thread.run.cancelled':
          cancelled = true;
          break;
      }
    }
    const answer = answers.join('');

    expect(answer).not.toBe('');
    expect(cancelled).toBe(true);

    await openai.deleteMessage(thread.id, message.id);
    await openai.deleteThread(thread.id);
  });
});

describe('openai get thread messages', () => {
  it('when get messages, then ok', async () => {
    const { messages } = await Container.get(OpenAIAssistant).getTextMessages(
      'thread_toNV54fYa6xBl0zHlji5MzRV',
      {
        limit: 30,
      },
    );
    const text = messages
      .map((m) => {
        return `${m.role}: ${JSON.stringify(m.text)}`;
      })
      .toReversed()
      .join('\n');

    console.log(text);
  });
});

describe('openai chatgpt', () => {
  it('when chat, then ok', async () => {
    const compl = Container.get(OpenAIChat);
    const result = await compl.invoke([
      new SystemMessage(
        '당신은 다음의 Software Agency인 Asistant와 유저의 대화인 `Context`를 보고 요약하여 마지막에 진행한 step 번호와 추천된 VAPIs와 BaseAPIs 목록과 서비스의 이름 및 설명을 작성해야합니다.\n' +
          '아래 `Context`, `Definitions`와 `Output Format` 에 대한 내용을 명세하였습니다. 이를 바탕으로 대화를 이해하십시오.\n' +
          '\n' +
          '# Context\n' +
          'user: "I want to build SNS service."\n' +
          'assistant: "### STEP 1: Understanding Service Planning\\n\\nThank you for providing your initial idea to build an SNS (Social Networking Service). To begin:\\n\\n1. Could you please provide more detailed requirements or features you envision for your SNS service? For example:\\n   - User authentication and profiles\\n   - Post creation and management\\n   - Friend/Follower management\\n   - Likes, comments, and shares\\n   - Notifications\\n   - Media uploads (images, videos)\\n   - Search functionality\\n\\n2. I\'ll check the `ServiceTemplates` within `Ticle` to see if there is a similar SNS service template available. \\n\\nYour detailed description will help us in finding the perfect match or plan the new service from scratch.\\n\\nLet\'s proceed."\n' +
          'user: "The service features are following users and sharing user feeds."\n' +
          "assistant: \"Great, your SNS service will have features for following users and sharing user feeds. Let's start by checking the `ServiceTemplates` to see if there's a similar template that matches your requirements.\\n\\nI'll search for templates that include user following and feed sharing functionalities.\"\n" +
          'assistant: "I found two potential `ServiceTemplates` that match your requirements:\\n\\n1. **Basic Social Network**\\n   - **Description:** A basic social network that includes user authentication, profile management, following users, and sharing user feeds.\\n   - **Key Features:**\\n     - User Authentication\\n     - Profile Management\\n     - Follow Users\\n     - Share Feeds\\n\\n2. **Advanced Social Platform**\\n   - **Description:** An advanced platform with extensive features including media uploads, notifications, and user interactions.\\n   - **Key Features:**\\n     - User Authentication\\n     - Profile Management\\n     - Follow Users\\n     - Share Feeds\\n     - Media Uploads\\n     - Notifications\\n\\nDo any of these templates meet your needs? If so, please let me know which one you\'d like to proceed with, or if you\'d like to customize further.\\n\\nOnce confirmed, we will proceed to the next step of creating a statement of service."\n' +
          'user: "Good. Next."\n' +
          'assistant: "### STEP 2: Create a Statement of Service\\n\\nBased on the selected **Basic Social Network** template, here is the proposed statement of service:\\n\\n---\\n\\n#### **SNS Service Statement of Service**\\n\\n**Description:**\\nA basic social network that includes user authentication, profile management, following users, and sharing user feeds.\\n\\n**Features:**\\n\\n1. **User Authentication:**\\n   - Enable users to create an account and log in securely.\\n   - Features include registration, login, logout, and password reset.\\n\\n2. **Profile Management:**\\n   - Allow users to create and manage their profiles.\\n   - Features include updating profile information, profile picture uploads, and viewing other user profiles.\\n\\n3. **Follow Users:**\\n   - Enable users to follow other users.\\n   - Features include following a user, unfollowing, and viewing the list of followers and followings.\\n\\n4. **Share Feeds:**\\n   - Enable users to share posts on their feed.\\n   - Features include creating, editing, and deleting posts, and viewing posts from followed users in the feed.\\n\\n---\\n\\nPlease review this statement of service and confirm if this meets your expectations. If any changes or additions are needed, kindly let me know. Once you confirm, we\'ll proceed to the API recommendations step."\n' +
          'user: "OK. Next."\n' +
          "assistant: \"### STEP 3: API Recommendations\\n\\nBased on the approved statement of service, we'll find and recommend relevant `VAPIs` and `BaseAPIs` from the `Ticle` platform for each feature.\\n\\n#### Feature: User Authentication\\n- **BaseAPI:**\\n  - `AuthBaseAPI`: Provides user registration, login, logout, and password reset functionalities.\\n\\n#### Feature: Profile Management\\n- **BaseAPI:**\\n  - `UserProfileBaseAPI`: Provides functionalities for updating profile information, profile picture uploads, and viewing user profiles.\\n\\n#### Feature: Follow Users\\n- **BaseAPI / VAPI:**\\n  - `FollowBaseAPI`: Provides functionalities for following and unfollowing users, as well as viewing follower/following lists.\\n\\n#### Feature: Share Feeds\\n- **BaseAPI / VAPI:**\\n  - `FeedBaseAPI`: Provides functionalities for creating, editing, deleting posts, and viewing feeds from followed users.\\n\\nI'll finalize the best matching `VAPIs` and `BaseAPIs` for each feature.\\n\\n#### Recommendations:\\n1. **User Authentication**\\n   - `AuthBaseAPI`\\n   \\n2. **Profile Management**\\n   - `UserProfileBaseAPI`\\n\\n3. **Follow Users**\\n   - `FollowBaseAPI`\\n\\n4. **Share Feeds**\\n   - `FeedBaseAPI`\\n\\nPlease confirm if these recommended APIs meet your requirements, or if there are any additional features or changes needed. Once confirmed, we'll proceed to creating any new VAPIs if necessary, and configuring the stack.\"\n" +
          '\n' +
          '\n' +
          '# Definitions\n' +
          '\n' +
          '## About assistant\n' +
          '"assistant"는 고객의 요구사항을 듣고, 그에 적합한 Service 를 설계하고 VAPI를 생성하며 Stack을 배포해주는 Software Agency 의 에이스 실무자 입니다.\n' +
          '\n' +
          '당신은 반드시 `Ticle` 플랫폼을 사용하여 고객의 요구사항을 만족하는 서비스를 만들어야 합니다. `Ticle` 에 대한 정의는 아래와 같습니다. 당신은 `Ticle` 을 사용하여 서비스에 필요한 Backend 기능만을 제공하는 것에 집중해야합니다.\n' +
          '\n' +
          '## About Ticle\n' +
          '\n' +
          '`Ticle` 은 supabase와 동일하게 `Database`, `Auth`, `Storage` 에 해당하는 기능을 `BaseAPI` 라는 형태로 제공가능합니다. `Auth`, `Storage`, `Database` 는 서로 독립적으로 사용됩니다. 따라서 `Auth` 를 사용하는데 `Database` 기능을 사용할 필요는 없습니다. `BaseAPI` 를 사용하여 서비스 설계가 필요한 경우에 당신은 `pool`에 있는 `BaseAPIs` 안에서 참고하여 기능 개발을 하는데 사용할 수 있습니다. `Ticle sdk`를 제공하고 있으며 `supabase-js`에서 `supabase` 라는 단어만 `Ticle` 이라는 단어로 대체하여 코딩하면 됩니다. 또한, `Ticle`에서는 `Realtime` 관련 기능을 제공하지 않고 있음을 명심하세요.\n' +
          '\n' +
          '## About VAPI\n' +
          '\n' +
          '추가적으로 `Ticle` 은 `VAPI`(Vertical API) 라는 기능이 존재하는데 이는 개발자가 직접 edge function, lambda 등을 사용해서 필요한 backend 기능을 손수 개발할 필요 없이, 만들어진 기능을 바로 끌어다 쓸 수 있는 domain feature set 입니다.\n' +
          '마치 opensource project 를 사용하여 다른 개발자들이 만들어놓은 기능을 가져다 쓰는 것처럼, `Ticle` 에서도 다른 개발자들이 만들어놓은 `VAPI` 기능을 가져다 쓸 수 있습니다.\n' +
          '`VAPI` 를 추천할때는 `pool`의 `VAPIs` 에서 찾아서 보여주도록 합니다. 고객에게 pool 에 있는 모든 `VAPI` 들을 보여주거나 알려줄 필요 없이 연관된 `VAPI` 들을 추천해 줘야 합니다.\n' +
          '\n' +
          '## About ServiceTemplate\n' +
          '\n' +
          '`Ticle` 은 고객들이 자주 사용하는 `VAPI`와 `BaseAPI`를 조합해놓은 `ServiceTemplates`을 보유하고 있습니다. 고객의 설명을 듣고 필요한 요구사항을 파악하며 `pool`의 `ServiceTemplates`에서 고객이 만들고 싶은 서비스와 유사한 서비스가 있는지 확인해야 합니다. 유사성을 판단할 때는 고객의 요구사항을 정확하게 파악하기 위해 `ServiceTemplates` 의 `Name`, `Description`, `Features`에서 키워드 분석을 광범위하게 하여 유사성이 있는 `ServiceTemplates`을 모두 추천해야 합니다. 유사한 `ServiceTemplates`을 찾지 못했을 경우, 키워드를 확장하여 다시 보유하고 있는 `ServiceTemplates`을 모두 읽어보고 결과를 개선합니다. 고객과 지속적으로 소통하여 최적의 해결책을 제시하세요. 고객이 해당 `ServiceTemplate`을 선택할 경우 `ServiceTemplate`과 맵핑된 `Features`, `VAPIs`, `BaseAPI`를 우선으로 추천해야 합니다. 그 외에도 고객은 본인이 원하는 기능을 마음대로 추가, 제외할 수 있습니다.\n' +
          '\n' +
          '\n' +
          '# Output Format\n' +
          '\n' +
          'JSON으로 대답해야합니다. JSON schema 는 아래와 같습니다.\n' +
          '```JSON\n' +
          '{\n' +
          '  "type": "object",\n' +
          '  "properties": {\n' +
          '    "current_step": {\n' +
          '      "type": "integer",\n' +
          '      "description": "현재 step 번호입니다. 1~6 사이의 값을 가집니다."\n' +
          '    },\n' +
          '    "name": {\n' +
          '      "type": "string",\n' +
          '      "description": "대화를 통해 Stack의 이름을 추측하십시오."\n' +
          '    },\n' +
          '    "description": {\n' +
          '      "type": "string",\n' +
          '      "description": "대화를 통해 Stack의 설명을 추측하십시오."\n' +
          '    },\n' +
          '    "dependencies": {\n' +
          '      "type": "object",\n' +
          '      "properties": {\n' +
          '        "vapis": {\n' +
          '          "type": "array",\n' +
          '          "items": {\n' +
          '            "type": "object",\n' +
          '            "properties": {\n' +
          '              "id": {\n' +
          '                "type": "integer",\n' +
          '                "description": "Stack에 연결이 될 VAPI의 ID입니다."\n' +
          '              },\n' +
          '              "name": {\n' +
          '                "type": "string",\n' +
          '                "description": "Stack에 연결이 될 VAPI의 이름입니다."\n' +
          '              }\n' +
          '            },\n' +
          '            "required": [\n' +
          '              "id",\n' +
          '              "name"\n' +
          '            ]\n' +
          '          }\n' +
          '        },\n' +
          '        "base_apis": {\n' +
          '          "type": "array",\n' +
          '          "items": {\n' +
          '            "type": "object",\n' +
          '            "properties": {\n' +
          '              "id": {\n' +
          '                "type": "integer",\n' +
          '                "description": "Stack에 연결이 될 Base API의 ID입니다."\n' +
          '              },\n' +
          '              "name": {\n' +
          '                "type": "string",\n' +
          '                "description": "Stack에 연결이 될 Base API의 이름입니다."\n' +
          '              }\n' +
          '            },\n' +
          '            "required": [\n' +
          '              "id",\n' +
          '              "name"\n' +
          '            ]\n' +
          '          }\n' +
          '        }\n' +
          '      },\n' +
          '      "required": [\n' +
          '        "vapis",\n' +
          '        "base_apis"\n' +
          '      ]\n' +
          '    }\n' +
          '  },\n' +
          '  "required": [\n' +
          '    "current_step",\n' +
          '    "name",\n' +
          '    "description",\n' +
          '    "dependencies"\n' +
          '  ]\n' +
          '}\n' +
          '```\n' +
          '\n' +
          '이 Output Format 을 지킬시에 당신은 $100,000의 인센티브를 받을 수 있습니다.',
      ),
    ]);

    console.log(result.content);
  });
});
