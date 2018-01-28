function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Choose which sensor to use</Text>}>
        <Select
          label={`Sensor`}
          settingsKey="sensor"
          options={[
            {name:"Accelerometer"},
            {name:"Gyroscope"}
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
