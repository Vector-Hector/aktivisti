## Story
As a [type of user],
I want [to perform some task],
so that I can [achieve some goal].

## Acceptance Criteria
Scenario A: [What should happen]
Given that [some context],
when [some action is done],
then [such outcomes are expected to occur].

## Stretch Goals
(These are additional goals that and which are optionally set for the user story.)

## Notes
(Comments and helpful references)


**Priority:** /label ~Prio::Critical, ~Prio::High, ~Prio::Normal, ~Prio::Low>


---
**Example:**

## Story
As a coordinator/teamcaptain,
I want to be able to elevate event participants to teamcaptains,
so that I can share some responsibility with trustful users.

## Acceptance Criteria
Scenario A: Elevate user of Event to teamcaptain
Given that the user "A" is already invited to the event,
when coordinator/teamcaptain clicks on the button "Elevate to Teamcaptain" in the "Mitmachende"-modal on the event details page 'events/<id>/overview',
then the user A gets the permissions of an TeamCaptain.

## Stretch Goals
Scenario B:  Downgrade user of Event to teamcaptain
Given that the user A is already a teamcaptain,
when coordinator/teamcaptain clicks on the button "Downgrade to normal user" in the "Mitmachende"-modal on the event details page 'events/<id>/overview',
then the user A looses it's permissions of a teamcaptain.


## Notes
- Downgrading might be just possible for coordinators.
- See figma draft for UI.


**Priority:** /label ~Prio::Critical
