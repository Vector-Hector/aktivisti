import { UserDto } from 'src/api/model/UserDto'
import { ApiRoute } from 'src/api/ApiRoute'
import { JSONResponse } from 'src/api/JSONResponse'

export class UserRoute extends ApiRoute<UserDto> {
  async elevateToTeamCaptain(id: string, subAssociation: number | undefined) {
    const response = await this.request({
      path: `${this.path}${id}/elevate-to-team-captain/`,
      method: 'POST',
      data: {
        sub_association: subAssociation
      }
    })
    return new JSONResponse(response, null)
  }
}
