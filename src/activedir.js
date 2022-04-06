function Search(search, SearchType) {
    var arrSearchResult = [];
    var strSearch = '';
    switch (SearchType) {
        case "contains":
            strSearch = "*" + search + "*";
            break;
        case "begins":
            strSearch = search + "*";
            break;
        case "ends":
            strSearch = "*" + search;
            break;
        case "exact":
            strSearch = search;
            break;
        default:
            strSearch = "*" + search + "*";
            break;
    }
    objRootDSE = GetObject("LDAP://RootDSE");
    strDomain = objRootDSE.Get("DefaultNamingContext");

    strOU = "OU=Users"; // Set the OU to search here.
    strAttrib = "name,samaccountname"; // Set the attributes to retrieve here.

    objConnection = new ActiveXObject("ADODB.Connection");
    objConnection.Provider = "ADsDSOObject";
    objConnection.Open("ADs Provider");
    objCommand = new ActiveXObject("ADODB.Command");
    objCommand.ActiveConnection = objConnection;
    var Dom = "LDAP://" + strOU + "," + strDomain;
    var arrAttrib = strAttrib.split(",");
    objCommand.CommandText = "select '" + strAttrib + "' from '" + Dom + "' WHERE objectCategory = 'user' AND objectClass='user' AND samaccountname='" + search + "' ORDER BY samaccountname ASC";

    try {

        objRecordSet = objCommand.Execute();

        objRecordSet.Movefirst;
        while (!(objRecordSet.EoF)) {
            var locarray = new Array();
            for (var y = 0; y < arrAttrib.length; y++) { locarray.push(objRecordSet.Fields(y).value); } arrSearchResult.push(locarray); objRecordSet.MoveNext;
        } return arrSearchResult;
    } catch (e) { alert(e.message); }
}
