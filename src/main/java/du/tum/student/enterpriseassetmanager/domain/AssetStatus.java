package du.tum.student.enterpriseassetmanager.domain;

public enum AssetStatus {
    AVAILABLE, // im Lager kann man benutzen
    ASSIGNED, // gehoert schon zu jemanden
    BROKEN, // kaput, warten auf reparieren
    REPARING, // schickt zu reparieren
    DISPOSED, // schrott
}
