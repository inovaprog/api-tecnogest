import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  AdminUpdateUserAttributesCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  AdminDisableUserCommand,
  InitiateAuthCommandInput,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  AttributeType,
  SignUpCommand,
  ConfirmSignUpCommandInput,
  ConfirmSignUpCommand,
  AdminDeleteUserCommand,
  UpdateUserAttributesCommand,
  VerifyUserAttributeCommandInput,
  VerifyUserAttributeCommand,
  AdminConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

const config = {
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: 'us-east-1',
};

const client = new CognitoIdentityProviderClient(config);

export default class Cognito {
  private static readonly logger = new Logger(Cognito.name);

  static async signUp(userAttributes: any) {
    this.logger.log(`Try to sign up user: ${userAttributes.email}`);
    const input = {
      ClientId: process.env.CLIENT_POOL_ID,
      Username: userAttributes.email,
      Password: userAttributes.password,
      UserAttributes: [
        {
          Name: 'email',
          Value: userAttributes.email,
        },
        {
          Name: 'name',
          Value: userAttributes.name,
        },
      ],
      ValidationData: [],
      UserPoolId: process.env.POOL_ID,
    };
    const command = new SignUpCommand(input);
    try {
      return await client.send(command);
    } catch (error) {
      this.logger.error(
        `Error in sign up to user: ${userAttributes.username}. Error: ${error.message}`,
      );
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  static async adminEditCognitoUser(email: string, attrs: AttributeType[]) {
    this.logger.log(
      `Try to update user: ${email} - attributes: ${JSON.stringify(attrs)}`,
    );
    const input = {
      Username: email,
      UserPoolId: process.env.POOL_ID,
      UserAttributes: attrs,
    };
    const command = new AdminUpdateUserAttributesCommand(input);
    try {
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`${error.message}. to user: ${email}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async confirmAccount(email: string) {
    const input = {
      Username: email,
      UserPoolId: process.env.POOL_ID,
    };
    const command = new AdminConfirmSignUpCommand(input);
    const response = await client.send(command);
    return response;
  }

  static async editCognitoUser(
    email: string,
    attrs: AttributeType[],
    accessToken: string,
  ) {
    this.logger.log(
      `Try to update user: ${email} - attributes: ${JSON.stringify(attrs)}`,
    );
    const input = {
      AccessToken: accessToken,
      Username: email,
      UserPoolId: process.env.POOL_ID,
      UserAttributes: attrs,
    };
    const command = new UpdateUserAttributesCommand(input);
    const response = await client.send(command);

    return response;
  }

  static async verifyAttribute(
    username: string,
    attributeName: string,
    code: string,
    accessToken: string,
  ) {
    const input: VerifyUserAttributeCommandInput = {
      AccessToken: accessToken,
      AttributeName: attributeName,
      Code: code,
    };
    const command = new VerifyUserAttributeCommand(input);
    try {
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`${error.message}. to user: ${username}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async signIn(email: string, password: string) {
    const input = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
      ClientId: process.env.CLIENT_POOL_ID,
    };
    const command = new InitiateAuthCommand(input);
    try {
      const response = await client.send(command);
      return response.AuthenticationResult;
    } catch (error) {
      const logMsg = `Could not sign in. Username: ${email} - Error: ${error.message}`;
      throw new HttpException(logMsg, HttpStatus.BAD_REQUEST);
    }
  }

  static async refreshSignIn(refreshToken: string) {
    const input: InitiateAuthCommandInput = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      ClientId: process.env.CLIENT_POOL_ID,
    };
    const command = new InitiateAuthCommand(input);
    try {
      const response = await client.send(command);
      return response.AuthenticationResult;
    } catch (error) {
      this.logger.error(`Refresh token is invalid.`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  static async forgotPassword(email: string) {
    this.logger.log(`Try to send code to forgot password to user: ${email}`);
    const input = {
      Username: email,
      ClientId: process.env.CLIENT_POOL_ID,
      UserPoolId: process.env.POOL_ID,
    };
    try {
      const command = new ForgotPasswordCommand(input);
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`${error.message}. to user: ${email}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async confirmForgotPassword(
    email: string,
    code: string,
    password: string,
  ) {
    const input = {
      Username: email,
      ConfirmationCode: code,
      Password: password,
      ClientId: process.env.CLIENT_POOL_ID,
      UserPoolId: process.env.POOL_ID,
    };
    try {
      const command = new ConfirmForgotPasswordCommand(input);
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`${error.message}.`);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  static async changePassword(
    token: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const input = {
      AccessToken: token,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword,
    };
    const command = new ChangePasswordCommand(input);
    const response = await client.send(command);
    return response;
  }

  static async disableUser(email: string) {
    const input = {
      Username: email,
      UserPoolId: process.env.POOL_ID,
    };
    const command = new AdminDisableUserCommand(input);
    const response = await client.send(command);
    return response;
  }

  static async addUserToGroup(username: string, group: string) {
    const input = {
      GroupName: group,
      Username: username,
      UserPoolId: process.env.POOL_ID,
    };
    const command = new AdminAddUserToGroupCommand(input);
    const response = await client.send(command);
    return response;
  }

  static async getUser(username: string) {
    this.logger.log(`Try get user from email: ${username}`);
    const input = {
      Username: username,
      UserPoolId: process.env.POOL_ID,
    };
    try {
      const command = new AdminGetUserCommand(input);
      const response = await client.send(command);
      return response;
    } catch (error) {
      this.logger.error(`Error: ${error.message}. to user: ${username}`);
      throw new HttpException(error.message, HttpStatus.OK);
    }
  }

  static async confirmSignUp(username: string, code: string) {
    const input: ConfirmSignUpCommandInput = {
      Username: username,
      ConfirmationCode: code,
      ClientId: process.env.CLIENT_POOL_ID,
    };
    const command = new ConfirmSignUpCommand(input);
    try {
      return await client.send(command);
    } catch (error) {
      this.logger.error(
        `Error to confirm signup: ${error.message}. to user: ${username}`,
      );
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  static async deleteUser(username: string) {
    this.logger.log(`Try delete user: ${username}`);
    const input = {
      Username: username,
      UserPoolId: process.env.POOL_ID,
    };
    const command = new AdminDeleteUserCommand(input);
    try {
      return await client.send(command);
    } catch (error) {
      this.logger.error(
        `Error to delete user: ${error.message}. to user: ${username}`,
      );
    }
  }
}
