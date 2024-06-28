import { Container } from 'typedi';
import { CompletionService } from '@/server/domain/assistant/completion.service';

describe('given completion service', () => {
  it('when call generateCreatingStackStateInfo, then OK', async () => {
    const stateInfo = await Container.get(
      CompletionService,
    ).generateCreatingStackStateInfo('thread_toNV54fYa6xBl0zHlji5MzRV');
    console.log(stateInfo);
    expect(stateInfo.current_step).toBe(6);
  });
});
