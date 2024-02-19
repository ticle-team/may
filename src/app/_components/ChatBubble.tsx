import classNames from "classnames";

type ChatBubbleProps = {
  self?: boolean;
  name: string;
  avatar: string;
  time?: string;
  message: string;
}

function ChatBubble({
                      self = false,
                      name, avatar,
                      time,
                      message
                    }: ChatBubbleProps) {
  return (
    <div className={classNames("flex gap-2.5 w-full", {
      "flex-row items-start": !self,
      "flex-row-reverse items-end": self,
    })}>
      <img className="w-8 h-8 rounded-full" src={avatar} alt={name}/>
      <div
        className={classNames("flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 dark:bg-gray-700", {
          "rounded-e-xl rounded-es-xl": !self,
          "rounded-s-xl rounded-se-xl": self,
        })}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
          {time && <time className="text-sm font-normal text-gray-500 dark:text-gray-400">{time}</time>}
        </div>
        <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">
          {message}
        </p>
      </div>
    </div>
  );
}

export default ChatBubble;