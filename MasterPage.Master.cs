using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

namespace Dengue_Info
{
    public partial class MasterPage : System.Web.UI.MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            // Support for FaceBook Social Meta Graph
            HtmlMeta meta = new HtmlMeta();
            meta.Attributes.Add("property", "og:title");
            meta.Attributes.Add("content", "疾病管制署登革熱地圖");
            Page.Header.Controls.Add(meta);

            meta = new HtmlMeta();
            meta.Attributes.Add("property", "og:description");
            meta.Attributes.Add("content", "疾病管制署登革熱地圖");
            Page.Header.Controls.Add(meta);

            meta = new HtmlMeta();
            meta.Attributes.Add("property", "og:image");
            meta.Attributes.Add("content", "http://cdcdengue.azurewebsites.net/data/images/dengue_map.png");
            Page.Header.Controls.Add(meta);

            meta = new HtmlMeta();
            meta.Attributes.Add("property", "og:url");
            meta.Attributes.Add("content", "http://cdcdengue.azurewebsites.net/VectorMap.aspx");
            Page.Header.Controls.Add(meta);

            meta = new HtmlMeta();
            meta.Attributes.Add("property", "og:type");
            meta.Attributes.Add("content", "website");
            Page.Header.Controls.Add(meta);  
        }
    }
}