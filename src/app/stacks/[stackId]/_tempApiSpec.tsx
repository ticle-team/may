export const tempApiSpec = `openapi: 3.0.0
info:
  title: Temp VAPI
  description: |
    VAPI for managing users. Provides the ability to view, edit, and unsubscribe users. 
    This VAPI depends on the 'Auth BaseAPI'
  version: "1.0.0"

paths:
  /get-user-info:
    get:
      summary: Retrieve user information
      parameters:
        - in: query
          name: user_id
          schema:
            type: string
          required: true
          description: The ID of the user to retrieve
      responses:
        '200':
          description: User information retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserInfo'
        '400':
          description: Missing user-id
        '405':
          description: Method not allowed
components:
  schemas:
    UserInfo:
      type: object
      properties:
        user_name:
          type: string
        full_name:
          type: string
        avatar_url:
          type: string
        email:
          type: string
        phone:
          type: string`;
