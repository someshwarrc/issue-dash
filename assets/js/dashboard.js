$(document).ready(function () {
  $("#pullIssueBtn").on("click", function () {
    $.ajax({
      url: `/issues/${as}`,
      type: "PUT",
      success: () => console.log("PUT Success"),
    });
  });
});
