///<reference path='typings/tsd.d.ts'/>
let moment=require("moment");
let d = new Date();
let todayStr = moment().format("YYYY-MM-DD");
let tomorrowStr = moment().add(1, 'day').format("YYYY-MM-DD");

var dateRangeSnippets = [
      {
            caption: "DateRange",
            snippet:
            `{
   \\$gte: new Date("\${3:${todayStr}}"),
   \\$lt: new Date("\${4:${tomorrowStr}}")
 }`,
            comment: 'Date Range',
            example:
            `{
   $gte: new Date("${todayStr}"),
   $lte: new Date("${tomorrowStr}")
}`,
            attachedToFindMethod: true
      },

      {
            caption: "DateRangeMomentJS",
            snippet:
            `{
   \\$gte: moment("\${3:${todayStr}}").startOf("day").toDate(),
   \\$lte: moment("\${3:${todayStr}}").endOf("day").toDate()
}`,
            comment: 'Date Range (use momentjs)',
            example:
            `{
   $gte: moment("${todayStr}").startOf("day").toDate(),
   $lte: moment("${todayStr}").endOf("day").toDate()
}`,
            attachedToFindMethod: true
      },
      {
            caption: "TodayDateRange",
            snippet:
            `{
   \\$gte: moment().startOf("day").toDate(),
   \\$lte: moment().endOf("day").toDate()
}`,
            comment: 'Today (use momentjs)',
            example:
            `{
   $gte: moment().startOf("day").toDate(),
   $lte: moment().endOf("day").toDate()
}`,
            attachedToFindMethod: true
      },

      {
            caption: "YesterdayDateRange",
            snippet:
            `{
   \\$gte: moment().subtract(1,"day").startOf("day").toDate(),
   \\$lte: moment().subtract(1,"day").endOf("day").toDate()
}`,
            comment: 'Yesterday (use momentjs)',
            example:
            `{
   $gte: moment().subtract(1,"day").startOf("day").toDate(),
   $lte: moment().subtract(1,"day").endOf("day").toDate()
}`,
      },

      {
            caption: "LastNdaysDateRange",
            snippet:
            `{
   \\$gte: moment().subtract(\${3:7},"day").startOf("day").toDate(),
   \\$lte: moment().endOf("day").toDate()
}`,
            comment: 'Last N days (use momentjs)',
            example:
            `{
   $gte: moment().subtract(N,"day").startOf("day").toDate(),
   $lte: moment().endOf("day").toDate()
}`,
            attachedToFindMethod: true
      },

      {
            caption: "LastNweeksDateRange",
            snippet:
            `{
   \\$gte: moment().subtract(\${3:1},"week").startOf("day").toDate(),
   \\$lte: moment().endOf("day").toDate()
}`,
            comment: 'Last N weeks (use momentjs)',
            example:
            `{
   $gte: moment().subtract(N,"week").startOf("day").toDate(),
   $lte: moment().endOf("day").toDate()
}`,
      },

      {
            caption: "LastNmonthsDateRange",
            snippet:
            `{
   \\$gte: moment().subtract(\${3:1},"month").startOf("day").toDate(),
   \\$lte: moment().endOf("day").toDate()
}`,
            comment: 'Last N months (use momentjs)',
            example:
            `{
   $gte: moment().subtract(N,"month").startOf("day").toDate(),
   $lte: moment().endOf("day").toDate()
}`,
      }

];

dateRangeSnippets = dateRangeSnippets.map((it: any) => {
      it.meta = "code template";

      return it;
});



export = dateRangeSnippets
