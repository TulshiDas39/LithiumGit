module com.bsse.gitstudio {
    requires javafx.controls;
    requires javafx.fxml;

    opens com.bsse.gitstudio to javafx.fxml;
    exports com.bsse.gitstudio;
}
