using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Data.SqlClient;
using System.Web.Configuration;
using System.Collections;
using System.Data;
using Newtonsoft.Json;
using System.Web.Script.Serialization;
using System.Text;
using System.Text.RegularExpressions;
using System.IO;
using System.Net;
using Newtonsoft.Json.Linq;

namespace Dengue_Info
{
    /// <summary>
    ///DengueData 的摘要描述
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    // 若要允許使用 ASP.NET AJAX 從指令碼呼叫此 Web 服務，請取消註解下列一行。
    [System.Web.Script.Services.ScriptService]
    public class DengueData : System.Web.Services.WebService
    {
        [WebMethod()]
        public String GetDengueData(string interval, string citycode, string gender, string immigration)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;
            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();

                string intervalcmd = "";
                if(interval != "1"){
                    intervalcmd = " and CONVERT(VARCHAR(10),sick_date,112) >= CONVERT(VARCHAR(10),DATEADD(year,-1,DATEADD(hh,8,GETDATE())),112) ";
                }
                
                string citycmd = "";
                if(citycode != "all"){
                    citycmd = " and residence_county = @citycode ";
                }
                
                string gendercmd = "";
                if (gender != "all"){
                     gendercmd = " and gender = @gender ";
                }

                string immcmd = "";
                if(immigration != "all"){
                    immcmd = " and immigration = @immigration ";
                }

                string conditstr = intervalcmd + citycmd + gendercmd + immcmd;

                //使用個案座標
                //string cmdstr = "select YEAR(sick_date) as sickyear, CAST(CONVERT(VARCHAR(10),sick_date,112) AS INT) as sickdate, c.city_name, gender, immigration, LAT as lat, LON as lng, CAST(determined_cnt AS INT) as count from DWS_DETERMINED_DF df inner join (select city_no, city_name from NIDSS_City where isnew = 1) c on df.residence_county = c.city_no where determined_cnt >= 1 " + conditstr + " and LAT is not null and LON is not null order by sickdate";
                
                //使用最小統計區
                string cmdstr = "select  CAST(CONVERT(VARCHAR(10),sick_date,112) AS INT) as sickdate, cb.Y as lat, cb.X as lng, CAST(df.determined_cnt AS INT) as count from DWS_DETERMINED_DF df left join NIDSS_codebase cb on df.CODEBASE = cb.CODEBASE where determined_cnt >= 1 " + conditstr + "  and cb.CODEBASE  is not null  and cb.Y is not null and cb.X is not null order by sickdate";
                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    if (citycode != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("citycode", citycode));
                    }

                    if (gender != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("gender", gender));
                    }

                    if (immigration != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("immigration", immigration));
                    }


                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }
            return jsonstr;
        }

        [WebMethod()]
        public String GetAggreateData(string interval, string citycode, string gender, string immigration)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;
            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();
                
                string intervalcmd = "  ";
                string calcmd = " 19980101 ";
                if (interval != "1")
                {
                    intervalcmd = " and CONVERT(VARCHAR(10),sick_date,112) >= CONVERT(VARCHAR(10),DATEADD(year,-1,DATEADD(hh,8,GETDATE())),112) ";
                    calcmd = "  CONVERT(VARCHAR(10),DATEADD(year,-1,DATEADD(hh,8,GETDATE())),112) ";
                    //intervalcmd = " and CONVERT(VARCHAR(10),sick_date,112) >= CONVERT(VARCHAR(10),'20170101',112) ";
                    //calcmd = " 20170101 ";
                }

                string citycmd = "";
                if (citycode != "all")
                {
                    citycmd = " and residence_county = @citycode ";
                }

                string gendercmd = "";
                if (gender != "all")
                {
                    gendercmd = " and gender = @gender ";
                }

                string immcmd = "";
                if (immigration != "all")
                {
                    immcmd = " and immigration = @immigration ";
                }

                string conditstr = intervalcmd + citycmd + gendercmd + immcmd;


                string cmdstr = "select  CAST(calendar.CAL_YMD AS INT) as sickdate, ISNULL(data.count,0) as count from (select YEAR(sick_date) as sickyear,CAST(CONVERT(VARCHAR(10),sick_date,112) AS INT) as sickdate, CAST(sum(determined_cnt) AS INT) as count from DWS_DETERMINED_DF where determined_cnt >= 1 " + conditstr + " group by sick_date) data right join (select CAL_YEAR,CAL_YMD from DIM_CAL where CAL_YMD between " + calcmd + " and CONVERT(nvarchar(30), DATEADD(hh,8,GETDATE()), 112)) calendar on data.sickdate = calendar.CAL_YMD order by sickdate";
                /*string cmdstr = "SELECT data.sickdate, ISNULL(data.count,0) AS COUNT FROM( SELECT YEAR(sick_date) AS sickyear, CAST(CONVERT(VARCHAR(10),sick_date,112) AS INT) AS sickdate, CAST(sum(determined_cnt) AS INT) AS COUNT FROM DWS_DETERMINED_DF WHERE determined_cnt >= 1 " + conditstr + " AND CONVERT(VARCHAR(10),sick_date,112) BETWEEN " + calcmd + " AND CONVERT(nvarchar(30), DATEADD(hh,8,GETDATE()), 112) GROUP BY sick_date) as DATA Order by sickdate asc;";*/

                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    if (citycode != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("citycode", citycode));
                    }

                    if (gender != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("gender", gender));
                    }

                    if (immigration != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("immigration", immigration));
                    }


                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }
            return jsonstr;
        }

        [WebMethod()]
        public String GetVillageData(string startdate, string villagestr, string immigration)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;
            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();
                string[] villagearray = villagestr.Split(',');
                string vilcmd = "  and (vil.county_name + replace(vil.town_name, '　','') + vil.village_name) in (";
                for (int i = 0; i < villagearray.Length; i++) {
                    if (i != (villagearray.Length - 1))
                    {
                        vilcmd += "'"+ villagearray[i] + "',";
                    }
                    else {
                        vilcmd += "'" + villagearray[i] + "') ";
                    }
                }

                string datecmd = " and CONVERT(VARCHAR(10),sick_date,112) >= @startdate ";
                string immcmd = "";
                if (immigration != "2")
                {
                    immcmd = " and immigration = @immigration ";
                }

                string conditstr = datecmd + immcmd;


                string cmdstr = "select  CAST(calendar.CAL_YMD AS INT) as sickdate, data.county_name as city, replace(data.town_name, '　','') as town, data.village_name as village, ISNULL(data.count,0) as count from (select YEAR(sick_date) as sickyear,CAST(CONVERT(VARCHAR(10),sick_date,112) AS INT) as sickdate, vil.county_name, vil.town_name, vil.village_name, CAST(sum(determined_cnt) AS INT) as count from DWS_DETERMINED_DF df left join (select * from DIM_VILLAGE) vil on df.residence_village = vil.village where determined_cnt >= 1 " + vilcmd + conditstr + " group by sick_date, vil.county_name, vil.town_name, vil.village_name) data right join (select CAL_YEAR,CAL_YMD from DIM_CAL where CAL_YMD between @startdate and CONVERT(nvarchar(30), DATEADD(hh,8,GETDATE()), 112)) calendar on data.sickdate = calendar.CAL_YMD order by sickdate";
                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    cmd.Parameters.Add(new SqlParameter("startdate", startdate));

                    if (immigration != "2")
                    {
                        cmd.Parameters.Add(new SqlParameter("immigration", immigration));
                    }

                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }
            return jsonstr;
        }

        [WebMethod()]
        public String GetDengueLocation(string citycode, string immigration)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;

            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();

                string city_cmdstr = "";
                // 20160410 add tainan and kaohsiung
                if (citycode == "05-07") {
                    city_cmdstr = " and ( residence_county = '05' or residence_county = '07' ) ";
                }
                else if (citycode != "all")
                {
                    city_cmdstr = " and residence_county = @citycode ";
                }
                
                string imm_scmdstr = "";
                if (immigration != "2")
                {
                    imm_scmdstr = " and immigration = @immigration ";
                }

                //使用個案座標
                //string cmdstr = "select YEAR(sick_date) as sickyear, CONVERT(VARCHAR(10),sick_date,111) as sickdate, LAT as lat, LON as lng, CAST(determined_cnt AS INT) as count from DWS_DETERMINED_DF df  where determined_cnt >=1 and residence_county = @citycode" + imm_scmdstr + " and LAT is not null and LON is not null order by sickdate";
                
                //使用最小統計區
                string cmdstr = "select CONVERT(VARCHAR(10),sick_date,111) as sickdate, cb.Y as lat, cb.X as lng, CAST(df.determined_cnt AS INT) as count from DWS_DETERMINED_DF df left join NIDSS_codebase cb on df.CODEBASE = cb.CODEBASE where determined_cnt >=1 " + city_cmdstr + imm_scmdstr + " and cb.CODEBASE  is not null  and cb.Y is not null and cb.X is not null order by sickdate";

                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {                    
                    if (citycode != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("citycode", citycode));
                    }

                    if (immigration != "2")
                    {
                        cmd.Parameters.Add(new SqlParameter("immigration", immigration));
                    }

                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }

            return jsonstr;        
        }

        // 20160410 reload the geo location to fetch data more efficiency
        [WebMethod()]
        public String GetDengueLocation(string citycode, string immigration, string startDate, string endDate)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;

            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();

                string city_cmdstr = "";
                // 20160410 add tainan and kaohsiung
                if (citycode == "05-07")
                {
                    city_cmdstr = " and ( residence_county = '05' or residence_county = '07' ) ";
                }
                else if (citycode == "01-31")
                {
                    city_cmdstr = " and ( residence_county = '01' or residence_county = '31' ) ";
                }
                else if (citycode == "05-07-43")
                {
                    city_cmdstr = " and ( residence_county = '05' or residence_county = '07' or residence_county = '43' ) ";
                }
                else if (citycode != "all")
                {
                    city_cmdstr = " and residence_county = @citycode ";
                }

                string imm_scmdstr = "";
                if (immigration != "2")
                {
                    imm_scmdstr = " and immigration = @immigration ";
                }

                //使用個案座標
                //string cmdstr = "select YEAR(sick_date) as sickyear, CONVERT(VARCHAR(10),sick_date,111) as sickdate, LAT as lat, LON as lng, CAST(determined_cnt AS INT) as count from DWS_DETERMINED_DF df  where determined_cnt >=1 and residence_county = @citycode" + imm_scmdstr + " and LAT is not null and LON is not null order by sickdate";

                // 使用最小統計區
                // 20160410 add start date and end date
                string cmdstr = "select CONVERT(VARCHAR(10),sick_date,111) as sickdate, cb.Y as lat, cb.X as lng, CAST(df.determined_cnt AS INT) as count from DWS_DETERMINED_DF df left join NIDSS_codebase cb on df.CODEBASE = cb.CODEBASE where determined_cnt >=1 " + city_cmdstr + imm_scmdstr + " and cb.CODEBASE  is not null  and cb.Y is not null and cb.X is not null and CONVERT(VARCHAR(10),sick_date,111) >= @STARTDATE and CONVERT(VARCHAR(10),sick_date,111) <= @ENDDATE order by sickdate";

                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    if (citycode != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("citycode", citycode));
                    }

                    if (immigration != "2")
                    {
                        cmd.Parameters.Add(new SqlParameter("immigration", immigration));
                    }

                    // 20160410 fetch data by date
                    cmd.Parameters.Add(new SqlParameter("STARTDATE", startDate));
                    cmd.Parameters.Add(new SqlParameter("ENDDATE", endDate));

                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }

            return jsonstr;
        }

        // 20160426 add the lastest clustering code1
        [WebMethod()]
        public String GetDengueClusterCODE1(string citycode)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;

            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();

                //使用最小統計區
                string cmdstr = "SELECT top 1 * FROM( SELECT * FROM ( SELECT CODE1 as code1, v.Town as town, v.Village as village, CONVERT(VARCHAR(10), min(Sick_date), 112) AS sick_date, sum(determined_cnt) AS ttl_determined_cnt FROM DWS_DETERMINED_DF d LEFT JOIN ( SELECT * FROM Village WHERE SUBSTRING(DWVillageCode, 1, 2) = @citycode) v ON d.residence_village = v.DWVillageCode WHERE infected_county = @citycode AND determined_cnt >= 1 AND CONVERT(VARCHAR(10), sick_date, 112) >= CONVERT(VARCHAR(10), DATEADD(day, @dateperoid, GETDATE()), 112) AND CODE1 IS NOT NULL AND CODE1 != 'undefined' GROUP BY CODE1 ,v.Town ,v.Village ) df WHERE df.ttl_determined_cnt >= 2 ) ttlCluster ORDER BY Sick_date desc;";

                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    if (citycode != "all")
                    {
                        cmd.Parameters.Add(new SqlParameter("citycode", citycode));
                    }

                    cmd.Parameters.Add(new SqlParameter("dateperoid", -14));

                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    DataTable dt = ds.Tables[0];
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }

            }

            return jsonstr;
        }

        [WebMethod()]
        public String GetImportedData()
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;

            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();

                //int yearval = int.Parse(year);


                //使用個案座標
                //string cmdstr = "select YEAR(sick_date) as sickyear, CONVERT(VARCHAR(10),sick_date,111) as sickdate, LAT as lat, LON as lng, CAST(determined_cnt AS INT) as count from DWS_DETERMINED_DF df  where determined_cnt >=1 and residence_county = @citycode" + imm_scmdstr + " and LAT is not null and LON is not null order by sickdate";

                //使用最小統計區
                string cmdstr = "select CONVERT(VARCHAR(10),sick_date,111) as sickdate, cb.Y as lat, cb.X as lng, DIM_COUNTRY.country_name, CAST(df.determined_cnt AS INT) as count from DWS_DETERMINED_DF df left join NIDSS_codebase cb on df.CODEBASE = cb.CODEBASE left join DIM_COUNTRY on df.infected_country = DIM_COUNTRY.country where immigration = 1 and  determined_cnt >=1 and year(sick_date) >=2001 and  country_name is not null order by sickdate";  //and cb.CODEBASE  is not null  and cb.Y is not null and cb.X is not null 

                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    //cmd.Parameters.Add(new SqlParameter("year", yearval));

                   
                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    //國家的座標中心點資訊
                    string filepath = Server.MapPath("data/dengue_layer/國家中心點.csv");
                    DataTable res = ConvertCSVtoDataTable(filepath);

                    ds.Tables[0].Columns.Add("country_code", typeof(String));
                    ds.Tables[0].Columns.Add("country_lat", typeof(Double));
                    ds.Tables[0].Columns.Add("country_lng", typeof(Double));
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        //預設以台灣中心點呈現(不需要可以直接拿掉)
                        ds.Tables[0].Rows[i]["lat"] = 23.9740931;
                        ds.Tables[0].Rows[i]["lng"] = 120.9799029;

                        for (int j = 0; j < res.Rows.Count; j++)
                        {
                            string country_name = ds.Tables[0].Rows[i]["country_name"].ToString();
                            if (country_name == res.Rows[j]["ch_name"].ToString())
                            {
                                ds.Tables[0].Rows[i]["country_code"] = res.Rows[j]["code"].ToString().ToLower();
                                ds.Tables[0].Rows[i]["country_lat"] = res.Rows[j]["latitude"];
                                ds.Tables[0].Rows[i]["country_lng"] = res.Rows[j]["longitude"];
                                continue;
                            }
                        }
                    }

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }
            return jsonstr;
        }

        [WebMethod()]
        public String GetIntEicdemic(string countrycode, string countryname)
        {
            string jsonstr = null;

            //HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://www.cdc.gov.tw/ExportOpenData.aspx?Type=csv&FromWeb=1");
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create("https://od.cdc.gov.tw/cdc/TCDCIntlEpidAll.csv");
            HttpWebResponse resp = (HttpWebResponse)req.GetResponse();

            StreamReader sr = new StreamReader(resp.GetResponseStream());
            //string bbb = sr.ReadLine();
            string[] headers = sr.ReadLine().Split(',');
            DataTable dt = new DataTable();
            foreach (string header in headers)
            {
                dt.Columns.Add(header);
            }
            while (!sr.EndOfStream)
            {
                string[] rows = sr.ReadLine().Split(new string[] { "\",\"" }, StringSplitOptions.None);
                //只抓登革熱，用headline和alert_disease判斷
                try
                {
                    if (rows[5].Contains("登革熱") || rows[11].Contains("登革熱"))
                    {
                        //抓出符合指定國家的，用headline、areaDesc中文國家名，和3166碼判斷
                        if (rows[5].Contains(countryname) || rows[12].Contains(countryname) || rows[15].Contains(countrycode))
                        {
                            DataRow dr = dt.NewRow();
                            for (int i = 0; i < headers.Length; i++)
                            {
                                dr[i] = rows[i].Replace("\"", "");
                            }
                            dt.Rows.Add(dr);
                        }
                    }
                }
                catch (Exception e) {
                    // just skip the error
                }
            }

            int[] visible_col = new int[] { 2, 5, 6, 8 };  //顯示effective, headline, description, web
            for (int i = dt.Columns.Count-1; i >=0; i--) {
                if (!(visible_col.Contains(i))) { 
                    dt.Columns.RemoveAt(i);
                }
            }

            sr.Close();

            jsonstr = JsonConvert.SerializeObject(dt, Formatting.Indented);

            return jsonstr;           
        }

        [WebMethod()]
        public String GetLastMosIndex(string citycode)
        {
            string jsonstr = null;
            using (WebClient wc = new WebClient())
            {
                if (citycode == "05") //台南市
                {
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/MosIndex_Tainan_last12m.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }else if (citycode == "07"){  //高雄市
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/MosIndex_Kaohsiung_last12m.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
            }
            return jsonstr;
        }

        [WebMethod()]
        public String GetDengueCluster(string citycode)
        {
            string jsonstr = null;
            using (WebClient wc = new WebClient())
            {
                if (citycode == "01") //台北市
                {
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/DengueCluster_Taipei.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
                else if (citycode == "05") //台南市
                {
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/DengueCluster_Tainan.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
                else if (citycode == "03") //台中市
                {
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/DengueCluster_Taichung.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
                else if (citycode == "07") //高雄市
                {  
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/DengueCluster_Kaohsiung.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
                else if (citycode == "43") //屏東縣
                {
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/DengueCluster_Pintung.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
                else if (citycode == "31") //新北市
                {
                    byte[] bResult = wc.DownloadData("https://od.cdc.gov.tw/eic/DengueCluster_NewTaipei.json");
                    jsonstr = Encoding.UTF8.GetString(bResult);
                }
            }
            return jsonstr;
        }

        [WebMethod()]
        public String GetDengueLocationForDraw(string citycode, string immigration)
        {
            string jsonstr = null;
            string connectionString = WebConfigurationManager.ConnectionStrings["DengueConnectionString"].ConnectionString;

            using (SqlConnection Conn = new SqlConnection(connectionString))
            {
                Conn.Open();
                string imm_scmdstr = "";
                if (immigration != "2")
                {
                    imm_scmdstr = " and immigration = @immigration ";
                }

                //使用個案座標
                string cmdstr = "select YEAR(sick_date) as sickyear, CONVERT(VARCHAR(10),sick_date,111) as sickdate, LAT as lat, LON as lng, CAST(determined_cnt AS INT) as count from DWS_DETERMINED_DF df  where determined_cnt >=1 and residence_county = @citycode" + imm_scmdstr + " and LAT is not null and LON is not null order by sickdate";

                //使用最小統計區
                //string cmdstr = "select CONVERT(VARCHAR(10),sick_date,111) as sickdate, cb.Y as lat, cb.X as lng, CAST(df.determined_cnt AS INT) as count from DWS_DETERMINED_DF df left join NIDSS_codebase cb on df.CODEBASE = cb.CODEBASE where determined_cnt >=1 and residence_county = @citycode " + imm_scmdstr + " and cb.CODEBASE  is not null  and cb.Y is not null and cb.X is not null order by sickdate";

                using (SqlCommand cmd = new SqlCommand(cmdstr, Conn))
                {
                    cmd.Parameters.Add(new SqlParameter("citycode", citycode));

                    if (immigration != "2")
                    {
                        cmd.Parameters.Add(new SqlParameter("immigration", immigration));
                    }

                    DataSet ds = new DataSet();
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    da.Fill(ds);
                    da.Dispose();

                    jsonstr = JsonConvert.SerializeObject(ds.Tables[0], Formatting.Indented);
                }
            }
            return jsonstr;
        }
        
        public static DataTable ConvertCSVtoDataTable(string strFilePath)
        {
            StreamReader sr = new StreamReader(strFilePath);
            string[] headers = sr.ReadLine().Split(',');
            DataTable dt = new DataTable();
            foreach (string header in headers)
            {
                dt.Columns.Add(header);
            }
            while (!sr.EndOfStream)
            {
                string[] rows = sr.ReadLine().Split(',');
                DataRow dr = dt.NewRow();
                for (int i = 0; i < headers.Length; i++)
                {
                    dr[i] = rows[i];
                }
                dt.Rows.Add(dr);
            }
            return dt;
        } 

        public static string DataTableToJSON(DataTable Dt)
        {
            string[] StrDc = new string[Dt.Columns.Count];

            string HeadStr = string.Empty;
            for (int i = 0; i < Dt.Columns.Count; i++)
            {

                StrDc[i] = Dt.Columns[i].Caption;
                HeadStr += "\"" + StrDc[i] + "\":\"" + StrDc[i] + i.ToString() + "¾" + "\",";

            }

            HeadStr = HeadStr.Substring(0, HeadStr.Length - 1);

            StringBuilder Sb = new StringBuilder();

            Sb.Append("[");

            for (int i = 0; i < Dt.Rows.Count; i++)
            {

                string TempStr = HeadStr;

                for (int j = 0; j < Dt.Columns.Count; j++)
                {

                    TempStr = TempStr.Replace(Dt.Columns[j] + j.ToString() + "¾", Dt.Rows[i][j].ToString().Trim());
                }
                //Sb.AppendFormat("{{{0}}},",TempStr);

                Sb.Append("{" + TempStr + "},");
            }

            Sb = new StringBuilder(Sb.ToString().Substring(0, Sb.ToString().Length - 1));

            if (Sb.ToString().Length > 0)
                Sb.Append("]");

            return StripControlChars(Sb.ToString());

        }

        public static string StripControlChars(string s)
        {
            return Regex.Replace(s, @"[^\x20-\x7F]", "");
        }

        [WebMethod]
        public String getGeoArea(String getCityCode, String getCode1) {
            String filePath = @"D:\home\site\wwwroot\data\geojson\";
            switch (getCityCode) {
                case "01":
                    filePath = filePath + "taipei_code1.json";
                    break;
                case "05":
                    filePath = filePath + "tainan_code1.json";
                    break;
                case "07":
                    filePath = filePath + "kaohsiung_code1.json";
                    break;
                case "43":
                    filePath = filePath + "pingtung_code1.json";
                    break;
                case "31":
                    filePath = filePath + "newtaipei_code1.json";
                    break;
            }


            // get all json content
            String jsonContent = getJSONContent(filePath);

            // parse into json content
            JObject jsonObj = JObject.Parse(jsonContent);

            int getCODE1Index = -1;
            String getGeoArea = "";
            for (int i = 0; i < jsonObj["features"].Count(); i++)
            {
                if (jsonObj["features"][i]["properties"]["CODE1"].ToString().Equals(getCode1))
                {
                    getCODE1Index = i;
                    getGeoArea = JsonConvert.SerializeObject(jsonObj["features"][i], Newtonsoft.Json.Formatting.Indented);
                    break;
                }
            }

            return getGeoArea;
        }

        private String getJSONContent(String filePath) {
            String retContent = "";
            try
            {
                if (File.Exists(filePath))
                {
                    retContent = File.ReadAllText(filePath);
                }
                else {
                    retContent = "{ status : \"The file does not exist.\" }";
                }
            }
            catch
            {
                retContent = "{ status : \"Reading json file is failure.\" }";
            }
            return retContent;
        }

    }
}
