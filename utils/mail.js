exports.generateHtml = (data) => {
  return `
<html>
  <head>
    <style>
      table,
      th,
      td {
        border: 1px solid black;
      }

      table {
        width: 100%;
      }

      th {
        width: 30%;
        text-align: left;
        padding: 10px;
      }

      .ln {
          color: red;
      }

      td {
        padding-left: 10px;
      }

      .img-license {
        width: 500px;
      }
    </style>
  </head>
  <body>
    <h2>Attempted Use of Blacklisted License</h2>

    <table>
      <tr>
        <th>License number</th>
        <td class="ln"><b>${data.DLN}</b></td>
      </tr>
      <tr>
        <th>Offence</th>
        <td>${data.offence}</td>
      </tr>
      <tr>
        <th>Date reported</th>
        <td>${data.reportedDate}</td>
      </tr>
      <tr>
        <th>Time reported</th>
        <td>${data.reportedTime}</td>
      </tr>
      <tr>
        <th>Date of incident</th>
        <td>${data.incidentDate}</td>
      </tr>
      <tr>
        <th>Time of incident</th>
        <td>${data.incidentTime}</td>
      </tr>
      <tr>
        <th>Name of offender</th>
        <td>${data.name}</td>
      </tr>
      <tr>
        <th>Image of offender</th>
        <td>
          <img src="cid:user" />
        </td>
      </tr>
      <tr>
        <th>Image of license</th>
        <td>
          <img
            class="img-license"
            src="cid:license"
          />
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
