import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './NewsHomewpWebPart.module.scss';
import * as strings from 'NewsHomewpWebPartStrings';

import { SPComponentLoader } from '@microsoft/sp-loader';

import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions, HttpClient
} from '@microsoft/sp-http';

export interface INewsHomewpWebPartProps {
  description: string;
}

export interface SPList {
  value: SPListItem[];
}

export interface SPListItem {
  ID: number;
  Title: string;
  Likes: number;
  TitleAr: string;
  Description: string;
  DescriptionAr: string;
  Published: Date;
  ImageUrl: string;
}

var totalcomments: number = 0;
export default class NewsHomewpWebPart extends BaseClientSideWebPart<INewsHomewpWebPartProps> {

  public render(): void {
    this.domElement.innerHTML = `
    <div class="${styles.newsHomewp}">
        <div id="spListContainer" >          
        </div>
    </div>`;
    // SPComponentLoader.loadScript(this.context.pageContext.site.absoluteUrl + '/_catalogs/masterpage/assets/libs/jquery/jquery.min.js', { globalExportsName: 'jQuery' }).then(($: any): void => {
    //  SPComponentLoader.loadScript(this.context.pageContext.site.absoluteUrl + '/_catalogs/masterpage/assets/libs/bootstrap/js/bootstrap.bundle.min.js', { globalExportsName: 'bootstrap' }).then((): void => {

    this._renderList();
    //});
    // });
  }

  private _getListData(): Promise<SPList> {
    var filterQuery =
      "?$top=4&$filter=IsActive  eq '1'&$orderby= Published desc ";
    var SiteURL =
      this.context.pageContext.site.absoluteUrl +
      `/_api/web/lists/GetByTitle('News and Announcements')/Items` +
      filterQuery;
    return this.context.spHttpClient.
      get(SiteURL, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getCommentsData(id): Promise<SPList> {
    var filterQuery =
      "?$top=4&$filter=(IsActive  eq '1')and(News_x0020_ID eq " + id + ")&$select=Title,ID,News_x0020_ID";
    var SiteURL =
      this.context.pageContext.site.absoluteUrl +
      `/_api/web/lists/GetByTitle('News Comments')/Items` +
      filterQuery;
    return this.context.spHttpClient.
      get(SiteURL, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _gettotalcommnets(id): number {
    var count: number;
    var filterQuery =
      "?$top=4&$filter=(IsActive  eq '1')and(News_x0020_ID eq " + id + ")&$select=Title,ID,News_x0020_ID";
    var SiteURL =
      this.context.pageContext.site.absoluteUrl +
      `/_api/web/lists/GetByTitle('News Comments')/Items` +
      filterQuery;
    //console.log(SiteURL);
    this.context.spHttpClient
      .get(SiteURL, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      }).then((res) => {
        if (res != null) {
          //console.log(res);
          count = res.length;
          return count;
        }
      })
    return count;
  }

  private async getCurrentUserWithAsyncAwait(id) {
    var filterQuery =
      "?$top=4&$filter=(IsActive  eq '1')and(News_x0020_ID eq " + id + ")&$select=Title,ID,News_x0020_ID";
    var SiteURL =
      this.context.pageContext.site.absoluteUrl +
      `/_api/web/lists/GetByTitle('News Comments')/Items` +
      filterQuery;
    var response = await this.context.spHttpClient.get(SiteURL, SPHttpClient.configurations.v1);
    return response;
    //   var comments = response.json().comments.value.length;;
    //.value.length;
    // totalcomments=comments.value.length;
    //console.log(totalcomments);
    //console.log(comments.value.length);
    // return comments.value.length;
  }

  public _renderList() {
    this._getListData().then((response) => {

      var SITEURL = this.context.pageContext.web.absoluteUrl;
      var flagEnglish = false;
      var noDataFound;
      var ListViewURL;
      var DetailViewUrl;
      var topic: string;
      var feature_a: string;
      var feature_b: string;
      if (SITEURL.indexOf("en-us") > -1) {
        flagEnglish = true;
        noDataFound = "No Data Found";
        topic = "News";
        feature_a = "View All";
        feature_b = "Read More";
      } else {
        noDataFound = "لاتوجد بيانات";
        topic = "أخبار";
        feature_a = "مشاهدة الكل";
        feature_b = "اقرأ أكثر";
      }
      let html: string = "<div></div>";
      html = `
      <div class="card news-card">
      <div class="card-header">
          <div class="row">
              <div class="col-sm-12 col-md-10">
                  <h3 class="news mb-0">${topic}</h3>
              </div>
              <div class="col-sm-12 col-md-2">
                  <div class="news-view">
                      <a class="view-all" href="news.aspx">${feature_a}</a>
                  </div>
              </div>
          </div>
      </div>
      <div class="card-body">
          <div class="row">
              <div class="col-sm-12">
                  <div id="carouselA" class="carousel slide carouselBoth" data-bs-ride="carousel" data-bs-interval="false">
                      <div class="carousel-inner px-3">                
      `;
      var counter = 0;


      if (response != null) {
        response.value.forEach((item: SPListItem) => {
          //var totalcomments= this._gettotalcommnets(item.ID);
          var totalc;
          let QLURL = item["Image"].Url;
          let Likes = item.Likes;
          let months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          let monthsAr = [
            "يناير",
            "فبراير",
            "مارس",
            "إبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
          ];
          var d = new Date(item.Published.toString());
          let date = d.getDate();
          let year = d.getFullYear();
          let month;

          var Title;
          var Description;
          if (flagEnglish) {
            Title = item.Title;
            Description = item.Description;
            month = months[d.getMonth()];
            ListViewURL =
              this.context.pageContext.web.absoluteUrl +
              "/en-us/Pages/news.aspx";
            DetailViewUrl =
              this.context.pageContext.site.absoluteUrl +
              "/en-us/Pages/newsdetail.aspx?newsid=" +
              item.ID;
          } else {
            Title = item.TitleAr;
            Description = item.DescriptionAr;
            month = monthsAr[d.getMonth()];
            ListViewURL =
              this.context.pageContext.web.absoluteUrl +
              "/ar-ae/Pages/news.aspx";
            DetailViewUrl =
              this.context.pageContext.site.absoluteUrl +
              "/ar-ae/Pages/newsdetail.aspx?newsid=" +
              item.ID;
          }
          if (counter == 0) {
            html += `
            <div class="carousel-item active">
            <div class="row">
                <div class="col-sm-12 col-md-7">
                    <h4 class="headlines">${Title}</h4>
                    <p class="headlines-text mb-0">${Description}</p>
                    <p class="headlines-date mb-0">${date + " " + month + " " + year}</p>
                    <div class="headlines-more">
                        <p class="like mb-0"><i NID="${item.ID}" count="${Likes}" class="mdi mdi-thumb-up likeclk"></i> ${Likes}</p>
                        <p class="comment mb-0"><a href="news-detail.html"><i class="mdi mdi-comment-multiple"></i> ${totalc}</a></p>
                        <a class="read-more mb-0" href=${DetailViewUrl}>${feature_b}</a>
                    </div>
                </div>
                <div class="col-sm-12 col-md-5">
                    <img class="d-block img-fluid news-img" src=${QLURL} alt="First slide">
                </div>
            </div>
        </div>
            `;
            counter++;
          } else {
            html += `
            <div class="carousel-item">
            <div class="row">
                <div class="col-sm-12 col-md-7">
                    <h4 class="headlines">${Title}</h4>
                    <p class="headlines-text mb-0">${Description}</p>
                    <p class="headlines-date mb-0">${date + " " + month + " " + year}</p>
                    <div class="headlines-more">
                        <p class="like mb-0"><i NID="${item.ID}" count="${Likes}" class="mdi mdi-thumb-up likeclk"></i> ${Likes}</p>
                        <p class="comment mb-0"><a href="news-detail.html"><i class="mdi mdi-comment-multiple"></i> ${totalc}</a></p>
                        <a class="read-more mb-0" href=${DetailViewUrl}>${feature_b}</a>
                    </div>
                </div>
                <div class="col-sm-12 col-md-5">
                    <img class="d-block img-fluid news-img" src=${QLURL} alt="First slide">
                </div>
            </div>
        </div>
            `;
          }
        });
      } else {
        html += `
        <div class="carousel-item active">
            <div class="row">
                <div class="col-sm-12 col-md-7">
                    <h4 class="headlines">${noDataFound}</h4>
                    <p class="headlines-text mb-0"></p>
                    <p class="headlines-date mb-0"></p>
                    <div class="headlines-more">
                        <p class="like mb-0"><i class="mdi mdi-thumb-up"></i></p>
                        <p class="comment mb-0"><a href="news-detail.html"><i class="mdi mdi-comment-multiple"></i></a></p>
                        <p class="share mb-0"><i class="mdi mdi-share-variant" data-bs-toggle="modal" data-bs-target="#share"></i></p>
                        <a class="read-more mb-0" href="#">Read More</a>
                    </div>
                </div>
                <div class="col-sm-12 col-md-5">
                    <img class="d-block img-fluid news-img" src="#" alt="First slide">
                </div>
            </div>
        </div>
        `;
      }

      html += `
      </div>
      <!-- Left and right controls/icons -->
      <button class="carousel-control-prev carousel-control" type="button" data-bs-target="#carouselA" data-bs-slide="prev">
          <i class="bx bx-chevron-left"></i>
      </button>
      <button class="carousel-control-next carousel-control" type="button" data-bs-target="#carouselA" data-bs-slide="next">
          <i class="bx bx-chevron-right"></i>
      </button>
  </div>
</div>
</div>
</div>
</div>
      `;
      let el = document.createElement("div") as HTMLDivElement;
      el.innerHTML = html;
      const listContainer: Element =
        this.domElement.querySelector("#spListContainer");
      listContainer.appendChild(el);
      this._bindlikesubmit();
    });
  }

  private CreateComment = (ID, count): void => {
    let body: string = "";
    body = JSON.stringify({
      'ID': ID,
      'Likes': count
    });

    this.context.spHttpClient.post(`${this.context.pageContext.site.absoluteUrl}/_api/web/lists/getbytitle('News and Announcements')/items`,
      SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      body: body
    })
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          response.json().then((responseJSON) => {
            alert(`Liked!`);
            //this._renderCommentsAsync();
          });
        } else {
          response.json().then((responseJSON) => {
            //console.log(responseJSON);
          });
        }
      }).catch(error => {
        console.log(error);
      });
  }

  private _bindlikesubmit(): void {
    var maindiv = document.getElementById("spListContainer");
    var allis = maindiv.querySelectorAll(".likeclk");
    let count;
    let id;
    allis.forEach(element => {
      element.addEventListener("click", (event) => {
        count = element.getAttribute("count");
        id = element.getAttribute("NID");
        count += 1;
        alert(count);
        this.CreateComment(id, count);
        event.preventDefault();
      });
    });
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
