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
   
      let html: string = "<div></div>";
      html = `
      `;
      var counter = 0;

var totalc;
      if (response != null) {
        response.value.forEach((item: SPListItem) => {
           this._getCommentsData(item.ID).then((response) => {
             totalc=response.value.length;
           });
       
         
   
            html += `
            <div class="carousel-item active">
            <div class="row">
                <div class="col-sm-12 col-md-7">
  
                        <p class="comment mb-0"><a href="news-detail.html"><i class="mdi mdi-comment-multiple"></i> ${totalc}</a></p>
                        <a class="read-more mb-0" href=${DetailViewUrl}>${feature_b}</a>
                    </div>
                </div>
           
            </div>
        </div>
            `;
            counter++;
        
      let el = document.createElement("div") as HTMLDivElement;
      el.innerHTML = html;
      const listContainer: Element =
        this.domElement.querySelector("#spListContainer");
      listContainer.appendChild(el);
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
