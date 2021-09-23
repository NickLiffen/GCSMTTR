
// Stream NEW data
const newData = {
    ApproximateCreationDateTime: 1631878248,
    Keys: { id: { S: 'octodemo/code-scanning-slack/18' } },
    NewImage: {
      alertCreatedAtDate: { N: '17' },
      organisationName: { S: 'octodemo' },
      alertCreatedAtFullTimestamp: { S: '2021-09-17T11:30:39Z' },
      alertClosedAtFullTimestamp: { S: 'TBA' },
      alertCreatedAtMonth: { N: '8' },
      alertCreatedAtYear: { N: '2021' },
      alertID: { N: '18' },
      alertURL: {
        S: 'https://github.com/octodemo/code-scanning-slack/security/code-scanning/18'
      },
      id: { S: 'octodemo/code-scanning-slack/18' },
      repositoryName: { S: 'code-scanning-slack' }
    },
    SequenceNumber: '7669900000000011517239238',
    SizeBytes: 351,
    StreamViewType: 'NEW_AND_OLD_IMAGES'
  }

// Stream Update data
const updateData = {
    ApproximateCreationDateTime: 1631884642,
    Keys: { id: { S: 'octodemo/code-scanning-slack/18' } },
    NewImage: {
      alertCreatedAtFullTimestamp: { S: '2021-09-17T11:30:39Z' },
      alertClosedAtFullTimestamp: {
        S: 'Fri Sep 17 2021 13:17:21 GMT+0000 (Coordinated Universal Time)'
      },
      alertClosedAtMonth: { S: '8' },
      alertClosedAtReason: { S: 'Fixed' },
      repositoryName: { S: 'code-scanning-slack' },
      alertCreatedAtDate: { N: '17' },
      organisationName: { S: 'octodemo' },
      alertClosedAtDate: { S: '17' },
      alertCreatedAtMonth: { N: '8' },
      alertCreatedAtYear: { N: '2021' },
      alertID: { N: '18' },
      alertURL: {
        S: 'https://github.com/octodemo/code-scanning-slack/security/code-scanning/18'
      },
      id: { S: 'octodemo/code-scanning-slack/18' },
      alertClosedAtYear: { S: '2021' }
    },
    OldImage: {
      alertCreatedAtDate: { N: '17' },
      organisationName: { S: 'octodemo' },
      alertCreatedAtFullTimestamp: { S: '2021-09-17T11:30:39Z' },
      alertClosedAtFullTimestamp: { S: 'TBA' },
      alertCreatedAtMonth: { N: '8' },
      alertCreatedAtYear: { N: '2021' },
      alertID: { N: '18' },
      alertURL: {
        S: 'https://github.com/octodemo/code-scanning-slack/security/code-scanning/18'
      },
      id: { S: 'octodemo/code-scanning-slack/18' },
      repositoryName: { S: 'code-scanning-slack' }
    },
    SequenceNumber: '8369400000000019687047987',
    SizeBytes: 811,
    StreamViewType: 'NEW_AND_OLD_IMAGES'
  }