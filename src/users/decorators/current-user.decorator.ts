import { createParamDecorator, ExecutionContext } from '@nestjs/common'; //Execution Context represents HTTP/gRPC/WebSockets/GraphQL etc

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // console.log(request.session.userId);

    return request.currentUser; //Comes from the create user interceptor
  },
);
